// Shared look and wording for the emails the site sends. The leading
// underscore keeps Vercel from treating this file as an API route.

const SITE = 'https://rgvaicoalition.com'
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// True when the saved meeting is clearly over. Dates are free text typed by
// an admin, so anything we cannot read counts as "not passed" and the admin
// confirms the details on screen before sending.
export function meetingHasPassed(meeting, now = Date.now()) {
  const when = new Date(`${meeting.event_date} ${meeting.event_time}`)
  if (isNaN(when)) return false
  return now - when.getTime() > 24 * 3600000
}

// The meeting's ticket link, only when it is a normal https address.
export function ticketLink(meeting) {
  const value = String(meeting?.ticket_url || '').trim()
  return /^https:\/\/[^\s"'<>]+\.[^\s"'<>]+$/.test(value) ? value : ''
}

function button(href, label) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0b63f6;color:#ffffff;font-weight:600;font-size:16px;padding:14px 30px;border-radius:980px;text-decoration:none;">${label}</a>`
}

// Light card on a soft grey page, with the logo on top.
// `unsubscribeUrl` adds the unsubscribe line (reminders only). The mailing
// address comes from the ORG_MAILING_ADDRESS setting and is left out until
// that is set, so no address is ever invented here.
export function emailLayout({ title, bodyHtml, footnote, unsubscribeUrl }) {
  const address = escapeHtml((process.env.ORG_MAILING_ADDRESS || '').trim())
  const footerLines = [
    `© 2026 RGV AI Coalition · ${address || 'Edinburg, TX'}`,
    footnote,
    unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#6e6e73;text-decoration:underline;">Unsubscribe from reminder emails</a>` : '',
  ].filter(Boolean)
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:${FONT};color:#1d1d1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;padding:40px 36px;max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;">
                    <img src="${SITE}/apple-touch-icon.png" width="36" height="36" alt="" style="display:block;border-radius:9px;" />
                  </td>
                  <td style="font-size:17px;font-weight:700;letter-spacing:-0.01em;color:#1d1d1f;">
                    RGV AI <span style="font-weight:500;color:#6e6e73;">Coalition</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:#1d1d1f;">${title}</h1>
            </td>
          </tr>
          ${bodyHtml}
          <tr>
            <td style="border-top:1px solid #e2e2e7;padding-top:24px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#6e6e73;">
                ${footerLines.join('<br/>\n                ')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function paragraph(html) {
  return `
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0;font-size:17px;line-height:1.6;color:#515154;">${html}</p>
            </td>
          </tr>`
}

function detailRow(label, value, last) {
  return `
                <tr>
                  <td style="${last ? '' : 'padding-bottom:16px;'}">
                    <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6e6e73;">${label}</p>
                    <p style="margin:4px 0 0;font-size:17px;line-height:1.45;color:#1d1d1f;">${value}</p>
                  </td>
                </tr>`
}

export function reminderSubject(meeting) {
  return `Reminder: RGV AI Coalition meets ${meeting.event_date}`
}

// The reminder an admin sends from the dashboard. Every meeting detail comes
// from the saved meeting, so nothing here needs editing between events.
export function buildReminderEmail(name, meeting, unsubscribeUrl) {
  const firstName = escapeHtml(String(name || '').trim().split(/\s+/)[0])
  const rows = [
    ['When', `${escapeHtml(meeting.event_date)} &nbsp;·&nbsp; ${escapeHtml(meeting.event_time)}`],
    ['Where', escapeHtml(meeting.location)],
  ]
  if (meeting.notes) rows.push(['Notes', escapeHtml(meeting.notes)])

  const bodyHtml = `${paragraph('A quick reminder that the next RGV AI Coalition meeting is coming up. We would love to see you there.')}
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;border-radius:16px;padding:22px 24px;">${rows.map(([label, value], i) => detailRow(label, value, i === rows.length - 1)).join('')}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              ${ticketLink(meeting) ? button(ticketLink(meeting), 'Get tickets') : button(`${SITE}/member`, 'Confirm in the member portal')}
            </td>
          </tr>${paragraph(ticketLink(meeting) ? 'Friends are welcome. Share the ticket link with them.' : 'It is free, and friends are welcome.')}`

  return emailLayout({
    title: firstName ? `See you soon, ${firstName}.` : 'See you soon.',
    bodyHtml,
    footnote: 'You are receiving this because you joined at rgvaicoalition.com.',
    unsubscribeUrl,
  })
}

// The automatic note sent the day before to members who confirmed.
export function buildDayBeforeEmail(name, meeting, unsubscribeUrl) {
  const firstName = escapeHtml(String(name || '').trim().split(/\s+/)[0])
  const rows = [
    ['When', `Tomorrow &nbsp;·&nbsp; ${escapeHtml(meeting.event_time)}`],
    ['Where', escapeHtml(meeting.location)],
  ]
  if (meeting.notes) rows.push(['Notes', escapeHtml(meeting.notes)])

  const bodyHtml = `${paragraph('You confirmed your attendance, so here are the details one more time.')}
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;border-radius:16px;padding:22px 24px;">${rows.map(([label, value], i) => detailRow(label, value, i === rows.length - 1)).join('')}
              </table>
            </td>
          </tr>`

  return emailLayout({
    title: firstName ? `See you tomorrow, ${firstName}.` : 'See you tomorrow.',
    bodyHtml,
    footnote: 'You are receiving this because you confirmed your attendance in the member portal.',
    unsubscribeUrl,
  })
}

export function buildPortalLinkEmail(actionLink) {
  const bodyHtml = `${paragraph('Use the button below to sign in to your RGV AI Coalition member portal. This link expires in 24 hours.')}
          <tr>
            <td style="padding-bottom:28px;">
              ${button(actionLink, 'Sign in to the member portal')}
            </td>
          </tr>`

  return emailLayout({
    title: 'Your member portal link',
    bodyHtml,
    footnote: 'If you did not request this, you can ignore it.',
  })
}
