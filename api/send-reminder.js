import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Edit this template for each event ───────────────────────────────────────
const EMAIL_FROM    = 'RGV AI Coalition <hello@rgvaicoalition.com>'
const EMAIL_SUBJECT = "We'll see you Wednesday — RGV AI Coalition"

function buildEmailHtml(name) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#050a12;font-family:'DM Sans',Arial,sans-serif;color:#f0f6ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050a12;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0c1524;border:1px solid #1a3050;border-radius:12px;padding:40px 36px;max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:24px;">
              <span style="font-family:Arial,sans-serif;font-weight:900;font-size:13px;letter-spacing:0.12em;color:#00d4ff;text-transform:uppercase;border:1px solid rgba(0,212,255,0.35);padding:5px 12px;border-radius:6px;">RGV AI</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#f0f6ff;line-height:1.2;">
                See you <span style="color:#00d4ff;">Wednesday</span>, ${name.split(' ')[0]}!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#8aa4c2;">
                Just a reminder that the first RGV AI Coalition meetup is coming up.
                We're looking forward to meeting you and the rest of the community.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1d30;border:1px solid #1a3050;border-radius:8px;padding:20px 24px;">
                <tr>
                  <td style="padding-bottom:14px;">
                    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4a6380;">When</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#f0f6ff;">Wednesday, May 20, 2026 &nbsp;·&nbsp; 7:00 PM</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#4a6380;">Where</p>
                    <p style="margin:4px 0 0;font-size:16px;color:#f0f6ff;">McAllen, TX &nbsp;·&nbsp; Location announced soon</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-size:15px;line-height:1.7;color:#8aa4c2;">
                No ticket needed. Just show up, bring a friend, and come ready to talk AI.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #1a3050;padding-top:24px;">
              <p style="margin:0;font-size:13px;color:#4a6380;">
                © 2026 RGV AI Coalition · McAllen, TX<br/>
                You're receiving this because you signed up at rgvaicoalition.com.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers['x-admin-token']
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: rsvps, error: fetchError } = await supabase
    .from('rsvps')
    .select('name, email')

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message })
  }

  const results = await Promise.allSettled(
    rsvps.map(({ name, email }) =>
      resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: EMAIL_SUBJECT,
        html: buildEmailHtml(name),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return res.status(200).json({ sent, failed, total: rsvps.length })
}
