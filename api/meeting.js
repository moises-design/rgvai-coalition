import { createClient } from '@supabase/supabase-js'
import { ADMIN, SUPER, requireAdmin } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

  const { event_date, event_time, location, notes } = req.body
  if (!event_date?.trim() || !event_time?.trim() || !location?.trim()) {
    return res.status(400).json({ error: 'Date, time, and location are required' })
  }

  const payload = {
    event_date: event_date.trim(),
    event_time: event_time.trim(),
    location: location.trim(),
    notes: notes?.trim() || null,
  }

  const [upsertResult] = await Promise.all([
    supabase.from('meeting_details').upsert({ id: 1, ...payload, updated_at: new Date().toISOString() }).select().single(),
    supabase.from('meetings_history').insert([payload]),
  ])

  if (upsertResult.error) return res.status(500).json({ error: upsertResult.error.message })
  return res.status(200).json(upsertResult.data)
}
