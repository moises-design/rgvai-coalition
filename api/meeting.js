import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function isAuthorized(req) {
  const token = req.headers['x-admin-token']
  return token === process.env.ADMIN_PASSWORD || token === process.env.SUPER_ADMIN_PASSWORD
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
