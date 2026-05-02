import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function isAdmin(req) {
  const token = req.headers['x-admin-token']
  return token === process.env.ADMIN_PASSWORD || token === process.env.SUPER_ADMIN_PASSWORD
}

function isSuperAdmin(req) {
  return req.headers['x-superadmin-token'] === process.env.SUPER_ADMIN_PASSWORD
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (isAdmin(req)) {
      const { data, error } = await supabase
        .from('meeting_confirmations')
        .select('id, confirmed_at, rsvps(name, email)')
        .eq('meeting_id', 1)
        .order('confirmed_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'Email or admin token required' })

    const { data: rsvp } = await supabase
      .from('rsvps').select('id').eq('email', email.toLowerCase()).single()
    if (!rsvp) return res.status(200).json({ confirmed: false })

    const { data: conf } = await supabase
      .from('meeting_confirmations').select('id')
      .eq('rsvp_id', rsvp.id).eq('meeting_id', 1).single()
    return res.status(200).json({ confirmed: !!conf })
  }

  if (req.method === 'POST') {
    const { email } = req.body
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' })

    const { data: rsvp } = await supabase
      .from('rsvps').select('id').eq('email', email.trim().toLowerCase()).single()
    if (!rsvp) return res.status(404).json({ error: 'No RSVP found for that email' })

    const { error } = await supabase.from('meeting_confirmations')
      .upsert({ rsvp_id: rsvp.id, meeting_id: 1 }, { onConflict: 'rsvp_id,meeting_id' })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ confirmed: true })
  }

  if (req.method === 'DELETE') {
    if (!isSuperAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })
    const { error } = await supabase.from('meeting_confirmations').delete().eq('meeting_id', 1)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ reset: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
