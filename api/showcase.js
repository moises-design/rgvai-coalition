import { createClient } from '@supabase/supabase-js'
import { SUPER, clientIp, overLimit, recordHit, requireAdmin } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MAX_PER_HOUR = 5 // submissions accepted per network address, per hour
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STATUSES = ['pending', 'approved', 'hidden']

// The table does not exist until the migration is applied.
const tableMissing = error => ['42P01', 'PGRST205'].includes(error?.code)
const clean = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)

// Only a normal https address, so a link on the showcase can never run code.
function httpsUrl(value) {
  const text = String(value || '').trim()
  if (text.length > 300 || /[\s"'<>]/.test(text)) return ''
  try {
    const url = new URL(text)
    return url.protocol === 'https:' && url.hostname.includes('.') ? url.href : ''
  } catch {
    return ''
  }
}

// "Show what you built".
//   GET    (public)              approved entries only, without emails
//   GET    (super admin)         every entry, for review in the dashboard
//   POST   (public)              submit an entry; it waits for approval
//   PATCH  (super admin)         approve or hide an entry
//   DELETE (super admin)         remove an entry
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const admin = Boolean(req.headers['x-superadmin-token'])
    if (admin && !await requireAdmin(supabase, req, res, 'x-superadmin-token', [SUPER()])) return

    let query = supabase
      .from('showcase_entries')
      .select(admin ? 'id, title, url, blurb, builder_name, email, status, created_at' : 'id, title, url, blurb, builder_name')
      .order('created_at', { ascending: false })
    if (!admin) query = query.eq('status', 'approved')
    const { data, error } = await query
    if (tableMissing(error)) return res.status(200).json({ open: false, entries: [] })
    if (error) {
      console.error('showcase: read failed', error.message)
      return res.status(500).json({ error: 'Could not load the showcase.' })
    }
    return res.status(200).json({ open: true, entries: data })
  }

  if (req.method === 'POST') {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    // Hidden field that people never see; only automated form fillers use it.
    if (clean(body.website, 200)) return res.status(200).json({ ok: true })

    const title = clean(body.title, 80)
    const blurb = clean(body.blurb, 200)
    const url = httpsUrl(body.url)
    const builderName = clean(body.name, 60)
    const email = String(body.email || '').trim().toLowerCase()
    if (!title) return res.status(400).json({ error: 'Give your project a name.' })
    if (!url) return res.status(400).json({ error: 'Add a link that starts with https://' })
    if (!blurb) return res.status(400).json({ error: 'Add one sentence about what it does.' })
    if (email && (email.length > 200 || !EMAIL.test(email))) {
      return res.status(400).json({ error: 'That email address does not look right.' })
    }

    const ip = clientIp(req)
    if (await overLimit(supabase, 'showcase', ip, MAX_PER_HOUR, 3600)) {
      return res.status(429).json({ error: 'Too many entries from this network. Please try again in an hour.' })
    }

    // Status is never taken from the request: every entry starts as pending.
    const { error } = await supabase.from('showcase_entries').insert([{
      title, url, blurb, builder_name: builderName || null, email: email || null, status: 'pending',
    }])
    if (tableMissing(error)) {
      return res.status(503).json({ error: 'The showcase is not open yet. Please check back soon.' })
    }
    if (error) {
      console.error('showcase: save failed', error.message)
      return res.status(500).json({ error: 'We could not save your entry. Please try again.' })
    }
    await recordHit(supabase, 'showcase', ip)
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH' || req.method === 'DELETE') {
    if (!await requireAdmin(supabase, req, res, 'x-superadmin-token', [SUPER()])) return
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const id = String(body.id || '')
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'Missing entry.' })

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('showcase_entries').delete().eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }
    if (!STATUSES.includes(body.status)) return res.status(400).json({ error: 'Unknown status.' })
    const { error } = await supabase
      .from('showcase_entries')
      .update({ status: body.status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
