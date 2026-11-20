import { createClient } from '@supabase/supabase-js'
import { validUnsubscribeToken } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Turns reminder emails off (or back on) for one member. The link in each
// reminder carries the member's email and a signed token. Only POST changes
// anything, so a mail scanner that merely opens the link cannot unsubscribe
// someone; mail apps' one-click unsubscribe sends a POST.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const email = String(req.query?.e || body.e || '').trim().toLowerCase()
  const token = String(req.query?.t || body.t || '')
  if (!validUnsubscribeToken(email, token)) {
    return res.status(400).json({ error: 'This unsubscribe link is not valid.' })
  }

  const optOut = body.action !== 'resubscribe'
  const { error } = await supabase.from('rsvps').update({ email_opt_out: optOut }).eq('email', email)
  if (error) {
    console.error('unsubscribe: update failed', error.message)
    return res.status(500).json({ error: 'We could not update your preference. Please email hello@rgvaicoalition.com.' })
  }
  return res.status(200).json({ ok: true, unsubscribed: optOut })
}
