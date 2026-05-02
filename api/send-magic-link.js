import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

function buildEmail(actionLink) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#050a12;font-family:'DM Sans',Arial,sans-serif;color:#f0f6ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050a12;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0c1524;border:1px solid #1a3050;border-radius:12px;padding:40px 36px;max-width:560px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-weight:900;font-size:13px;letter-spacing:0.12em;color:#00d4ff;text-transform:uppercase;border:1px solid rgba(0,212,255,0.35);padding:5px 12px;border-radius:6px;">RGV AI</span>
        </td></tr>
        <tr><td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#f0f6ff;">Your member portal link</h1>
        </td></tr>
        <tr><td style="padding-bottom:28px;">
          <p style="margin:0;font-size:16px;line-height:1.7;color:#8aa4c2;">Click below to sign in to your RGV AI Coalition member portal. This link expires in 24 hours.</p>
        </td></tr>
        <tr><td style="padding-bottom:28px;" align="center">
          <a href="${actionLink}" style="display:inline-block;background:#00d4ff;color:#050a12;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Sign in to member portal →
          </a>
        </td></tr>
        <tr><td style="border-top:1px solid #1a3050;padding-top:24px;">
          <p style="margin:0;font-size:13px;color:#4a6380;">© 2026 RGV AI Coalition · Edinburg, TX<br/>If you didn't request this, ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, checkRsvp } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const normalizedEmail = email.trim().toLowerCase()

  if (checkRsvp) {
    const { data: rsvp } = await supabase
      .from('rsvps').select('email').eq('email', normalizedEmail).single()
    if (!rsvp) return res.status(404).json({ error: 'no-rsvp' })
  }

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
    html: buildEmail(linkData.action_link),
  })

  if (sendError) return res.status(500).json({ error: 'Failed to send email' })

  return res.status(200).json({ ok: true })
}
