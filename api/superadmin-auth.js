import { createClient } from '@supabase/supabase-js'
import { SUPER, checkPassword } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Checks the password typed on the login screen. Wrong guesses are counted
// per network address and refused for 15 minutes after too many.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { password } = req.body || {}
  const status = await checkPassword(supabase, req, password, [SUPER()])
  if (status === 'ok') return res.status(200).json({ ok: true })
  if (status === 'limited') {
    return res.status(429).json({ error: 'Too many wrong passwords. Wait 15 minutes and try again.' })
  }
  return res.status(401).json({ error: 'Incorrect password' })
}
