import { createClient } from '@supabase/supabase-js'
import { buildDayBeforeEmail } from './_email.js'
import { ADMIN, SUPER, requireAdmin, unsubscribeHeaders, unsubscribeLinks } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const cronAuth = process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  if (!cronAuth && !await requireAdmin(supabase, req, res, 'x-admin-token', [ADMIN(), SUPER()])) return

  const { data: meeting } = await supabase.from('meeting_details').select('*').eq('id', 1).single()
  if (!meeting) return res.status(200).json({ skipped: 'No meeting set' })

  const meetingDate = new Date(`${meeting.event_date} ${meeting.event_time}`)
  if (isNaN(meetingDate)) return res.status(200).json({ skipped: 'Could not parse meeting date' })

  const hoursUntil = (meetingDate - Date.now()) / 3600000
  if (hoursUntil < 20 || hoursUntil > 28) {
    return res.status(200).json({ skipped: `Meeting is ${hoursUntil.toFixed(1)}h away` })
  }

  const load = columns => supabase.from('meeting_confirmations').select(`rsvps(${columns})`).eq('meeting_id', 1)
  let { data: confirmed, error } = await load('name, email, email_opt_out')
  // The opt-out column may not be in the database yet.
  if (error) ({ data: confirmed } = await load('name, email'))

  // Members who unsubscribed are never emailed.
  const confirmations = (confirmed || []).filter(({ rsvps: member }) => member && !member.email_opt_out)
  if (!confirmations.length) return res.status(200).json({ sent: 0, total: 0 })

  const results = await Promise.allSettled(
    confirmations.map(({ rsvps: member }) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RGV AI Coalition <hello@rgvaicoalition.com>',
          to: member.email,
          subject: `See you tomorrow: RGV AI Coalition at ${meeting.event_time}`,
          html: buildDayBeforeEmail(member.name, meeting, unsubscribeLinks(member.email).page),
          headers: unsubscribeHeaders(member.email),
        }),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return res.status(200).json({ sent, total: confirmations.length })
}
