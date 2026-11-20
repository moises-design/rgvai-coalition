import { createClient } from '@supabase/supabase-js'
import { ADMIN, SUPER, requireAdmin } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function isHttpsUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.includes('.')
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!await requireAdmin(supabase, req, res, 'x-admin-token', [ADMIN(), SUPER()])) return

  // GET: the log of saved meetings, for the dashboard. The table has no
  // public access, so the dashboard reads it here.
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('meetings_history').select('*').order('recorded_at', { ascending: false }).limit(20)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  const { event_date, event_time, location, notes, ticket_url } = req.body
  if (!event_date?.trim() || !event_time?.trim() || !location?.trim()) {
    return res.status(400).json({ error: 'Date, time, and location are required' })
  }

  // Optional ticket link. It becomes a button on the public home page and in
  // emails, so only a normal https web address is accepted.
  const ticketUrl = typeof ticket_url === 'string' ? ticket_url.trim() : ''
  if (ticketUrl && !isHttpsUrl(ticketUrl)) {
    return res.status(400).json({ error: 'The ticket link must be a full web address starting with https://' })
  }

  const payload = {
    event_date: event_date.trim(),
    event_time: event_time.trim(),
    location: location.trim(),
    notes: notes?.trim() || null,
  }

  const save = extra => supabase.from('meeting_details')
    .upsert({ id: 1, ...payload, ...extra, updated_at: new Date().toISOString() }).select().single()

  let [upsertResult] = await Promise.all([
    save({ ticket_url: ticketUrl || null }),
    supabase.from('meetings_history').insert([payload]),
  ])

  // The ticket link column may not be in the database yet. Save the rest, and
  // say so if a link was typed, so it is not silently dropped.
  let ticketSaved = true
  if (upsertResult.error && ['42703', 'PGRST204'].includes(upsertResult.error.code)) {
    ticketSaved = !ticketUrl
    upsertResult = await save({})
  }

  if (upsertResult.error) return res.status(500).json({ error: upsertResult.error.message })
  return res.status(200).json({ ...upsertResult.data, ticket_saved: ticketSaved })
}
