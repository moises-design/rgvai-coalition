import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildPortalLinkEmail } from './_email.js'
import { clientIp, overLimit, recordHit } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email required' })

  const normalizedEmail = email.trim().toLowerCase()
  const ip = clientIp(req)

  // Limits, so this route cannot be used to flood an inbox: 3 links per
  // address and 10 requests per network address, each per 15 minutes.
  if (await overLimit(supabase, 'link_ip', ip, 10, 15 * 60) ||
      await overLimit(supabase, 'link_email', normalizedEmail, 3, 15 * 60)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' })
  }
  await recordHit(supabase, 'link_ip', ip)

  // Links only ever go to people who have joined.
  const { data: rsvp } = await supabase
    .from('rsvps').select('email').eq('email', normalizedEmail).single()
  if (!rsvp) return res.status(404).json({ error: 'no-rsvp' })
  await recordHit(supabase, 'link_email', normalizedEmail)

  const linkRes = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'magiclink',
      email: normalizedEmail,
      options: { redirect_to: 'https://rgvaicoalition.com/member' },
    }),
  })

  const linkData = await linkRes.json()
  if (!linkData.action_link) return res.status(500).json({ error: 'Failed to generate link' })

  const { error: sendError } = await resend.emails.send({
    from: 'RGV AI Coalition <hello@rgvaicoalition.com>',
    to: normalizedEmail,
    subject: 'Your RGV AI Coalition member portal link',
    html: buildPortalLinkEmail(linkData.action_link),
  })

  if (sendError) return res.status(500).json({ error: 'Failed to send email' })

  return res.status(200).json({ ok: true })
}
