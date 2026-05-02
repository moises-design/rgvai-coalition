import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = req.headers['x-superadmin-token']
  if (!token || token !== process.env.SUPER_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { email, role } = req.body
  if (!email || !['member', 'admin', 'super_admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid email or role' })
  }
  const { error } = await supabase.from('rsvps').update({ role }).eq('email', email)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
