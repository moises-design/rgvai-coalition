import { createClient } from '@supabase/supabase-js'
import { ADMIN, SUPER, clientIp, interestVoterKey, overLimit, recordHit, requireAdmin, validInterestToken } from './_guard.js'
import { RESULTS_MIN_PEOPLE, TOPIC_IDS } from '../src/data/topics.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_PER_HOUR = 20 // answers accepted per network address, per hour
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BROWSER_ID = /^[a-z0-9-]{16,64}$/i

// The table does not exist until the migration is applied.
const tableMissing = error => ['42P01', 'PGRST205'].includes(error?.code)

const knownTopics = value => [...new Set(Array.isArray(value) ? value : [])].filter(id => TOPIC_IDS.includes(id))
const clean = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)

function totals(rows) {
  return TOPIC_IDS.map(id => ({
    id,
    learn: rows.filter(row => (row.learn || []).includes(id)).length,
    teach: rows.filter(row => (row.teach || []).includes(id)).length,
  }))
}

// The "Learn or teach" board.
//   GET  (public)          totals per topic, only once enough people answered
//   GET  (admin password)  every answer, for the dashboard
//   POST (public)          save or replace one person's answers; no account
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const admin = Boolean(req.headers['x-admin-token'])
    if (admin && !await requireAdmin(supabase, req, res, 'x-admin-token', [ADMIN(), SUPER()])) return

    const { data, error } = await supabase
      .from('topic_interest')
      .select(admin ? 'learn, teach, teach_note, suggestion, email, source, updated_at' : 'learn, teach')
      .order(admin ? 'updated_at' : 'voter_key', { ascending: false })
    if (tableMissing(error)) return res.status(200).json({ open: false, ready: false })
    if (error) {
      console.error('interest: read failed', error.message)
      return res.status(500).json({ error: 'Could not load the results.' })
    }

    if (admin) return res.status(200).json({ open: true, people: data.length, topics: totals(data), answers: data })
    // Below the minimum, no numbers leave the server at all.
    if (data.length < RESULTS_MIN_PEOPLE) return res.status(200).json({ open: true, ready: false })
    return res.status(200).json({ open: true, ready: true, people: data.length, topics: totals(data) })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const learn = knownTopics(body.learn)
  const teach = knownTopics(body.teach)
  const teachNote = teach.length ? clean(body.teachNote, 200) : ''
  const suggestion = clean(body.suggestion, 200)
  if (!learn.length && !teach.length && !suggestion) {
    return res.status(400).json({ error: 'Pick at least one topic first.' })
  }

  // Someone who came from a reminder email is known by the signed link.
  const linkEmail = String(body.e || '').trim().toLowerCase()
  const fromEmailLink = validInterestToken(linkEmail, String(body.t || ''))
  const typedEmail = String(body.email || '').trim().toLowerCase()
  if (typedEmail && !EMAIL.test(typedEmail)) {
    return res.status(400).json({ error: 'That email address does not look right.' })
  }
  const email = fromEmailLink ? linkEmail : typedEmail
  if (teach.length && !email) {
    return res.status(400).json({ error: 'Add your email so we can reach you about teaching.' })
  }

  const browserId = String(body.voter || '')
  if (!fromEmailLink && !BROWSER_ID.test(browserId)) {
    return res.status(400).json({ error: 'Please reload the page and try again.' })
  }

  const ip = clientIp(req)
  if (await overLimit(supabase, 'interest', ip, MAX_PER_HOUR, 3600)) {
    return res.status(429).json({ error: 'Too many answers from this network. Please try again in an hour.' })
  }

  const { error } = await supabase.from('topic_interest').upsert({
    voter_key: interestVoterKey(fromEmailLink ? `email:${linkEmail}` : `browser:${browserId}`),
    learn,
    teach,
    teach_note: teachNote || null,
    suggestion: suggestion || null,
    email: email || null,
    source: ['web', 'email', 'qr'].includes(body.source) ? body.source : 'web',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'voter_key' })
  if (tableMissing(error)) {
    return res.status(503).json({ error: 'The board is not open yet. Please check back soon.' })
  }
  if (error) {
    console.error('interest: save failed', error.message)
    return res.status(500).json({ error: 'We could not save your answers. Please try again.' })
  }
  await recordHit(supabase, 'interest', ip)
  return res.status(200).json({ ok: true })
}
