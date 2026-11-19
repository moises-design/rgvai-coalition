import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Receives "Book your front desk review" requests from /ai-for-healthcare.
// Stores the request in Supabase, then emails a notification to the address in
// FRONT_DESK_NOTIFY_EMAIL (skipped when that variable is not set).

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const WORKFLOWS = ['Missed calls', 'Reminders and no-shows', 'Billing follow-up', 'Not sure yet']

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmail(request) {
  const rows = [
    ['Name', request.name],
    ['Clinic or practice', request.clinic],
    ['Email', request.email],
    ['Phone', request.phone || 'Not given'],
    ['Workflow that hurts most', request.workflow || 'Not given'],
    ['Message', request.message || 'None'],
  ]
    .map(([label, value]) => `
        <tr>
          <td style="padding:8px 12px 8px 0;font-size:13px;color:#8aa4c2;vertical-align:top;white-space:nowrap;">${label}</td>
          <td style="padding:8px 0;font-size:15px;color:#f0f6ff;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#050a12;font-family:Arial,sans-serif;color:#f0f6ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050a12;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0c1524;border:1px solid #1a3050;border-radius:12px;padding:32px;max-width:560px;width:100%;">
        <tr><td style="padding-bottom:16px;">
          <h1 style="margin:0;font-size:22px;color:#f0f6ff;">New front desk review request</h1>
        </td></tr>
        <tr><td>
          <table cellpadding="0" cellspacing="0" width="100%">${rows}
          </table>
        </td></tr>
        <tr><td style="border-top:1px solid #1a3050;padding-top:16px;">
          <p style="margin:0;font-size:13px;color:#4a6380;">Sent from rgvaicoalition.com/ai-for-healthcare. Reply to this email to answer ${escapeHtml(request.name)}.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // Honeypot: real visitors never see or fill this field.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true })

  const request = {
    name: clean(body.name, 120),
    clinic: clean(body.clinic, 160),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    workflow: WORKFLOWS.includes(body.workflow) ? body.workflow : '',
    message: clean(body.message, 1000),
  }

  if (!request.name || !request.clinic) {
    return res.status(400).json({ error: 'Name and clinic are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    return res.status(400).json({ error: 'A valid email is required' })
  }

  const { error: insertError } = await supabase.from('front_desk_review_requests').insert([{
    name: request.name,
    clinic: request.clinic,
    email: request.email,
    phone: request.phone || null,
    workflow: request.workflow || null,
    message: request.message || null,
  }])

  if (insertError) return res.status(500).json({ error: 'Failed to save request' })

  // The request is saved at this point, so a failed notification is logged
  // but does not fail the visitor's submission.
  const notifyEmail = process.env.FRONT_DESK_NOTIFY_EMAIL
  if (notifyEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: sendError } = await resend.emails.send({
      from: 'RGV AI Coalition <hello@rgvaicoalition.com>',
      to: notifyEmail,
      replyTo: request.email,
      subject: `Front desk review request: ${request.clinic}`,
      html: buildEmail(request),
    })
    if (sendError) console.error('front-desk-review: notification email failed', sendError)
  }

  return res.status(200).json({ ok: true })
}
