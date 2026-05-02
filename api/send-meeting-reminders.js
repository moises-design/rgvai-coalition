import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const cronAuth = process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`
  const adminToken = req.headers['x-admin-token']
  const adminAuth = adminToken && (adminToken === process.env.ADMIN_PASSWORD || adminToken === process.env.SUPER_ADMIN_PASSWORD)
  if (!cronAuth && !adminAuth) return res.status(401).json({ error: 'Unauthorized' })

  const { data: meeting } = await supabase.from('meeting_details').select('*').eq('id', 1).single()
  if (!meeting) return res.status(200).json({ skipped: 'No meeting set' })

  const meetingDate = new Date(`${meeting.event_date} ${meeting.event_time}`)
  if (isNaN(meetingDate)) return res.status(200).json({ skipped: 'Could not parse meeting date' })

  const hoursUntil = (meetingDate - Date.now()) / 3600000
  if (hoursUntil < 20 || hoursUntil > 28) {
    return res.status(200).json({ skipped: `Meeting is ${hoursUntil.toFixed(1)}h away` })
  }

  const { data: confirmations } = await supabase
    .from('meeting_confirmations')
    .select('rsvps(name, email)')
    .eq('meeting_id', 1)

  if (!confirmations?.length) return res.status(200).json({ sent: 0, total: 0 })

  const results = await Promise.allSettled(
    confirmations.map(({ rsvps: member }) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RGV AI Coalition <onboarding@resend.dev>',
          to: member.email,
          subject: `See you tomorrow — RGV AI Coalition at ${meeting.event_time}`,
          html: `<p>Hi ${member.name},</p><p>Just a reminder: the RGV AI Coalition meeting is <strong>tomorrow at ${meeting.event_time}</strong> at ${meeting.location}.</p>${meeting.notes ? `<p>${meeting.notes}</p>` : ''}<p>You confirmed your attendance — see you there!</p>`,
        }),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return res.status(200).json({ sent, total: confirmations.length })
}
