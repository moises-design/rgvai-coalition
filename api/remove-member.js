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
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const authUser = users?.find(u => u.email === email)
  if (authUser) await supabase.auth.admin.deleteUser(authUser.id)

  const { error } = await supabase.from('rsvps').delete().eq('email', email)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
