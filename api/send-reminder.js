import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildReminderEmail, meetingHasPassed, reminderSubject } from './_email.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

function isAuthorized(req) {
  const token = req.headers['x-admin-token']
  return token === process.env.ADMIN_PASSWORD || token === process.env.SUPER_ADMIN_PASSWORD
}

const EMAIL_FROM = 'RGV AI Coalition <hello@rgvaicoalition.com>'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { targetRole } = req.body || {}

  // The email is built from the saved meeting, so there must be a current one.
  const { data: meeting } = await supabase.from('meeting_details').select('*').eq('id', 1).single()
  if (!meeting) {
    return res.status(400).json({ error: 'No meeting is set. Add the next meeting in the Meetings tab first.' })
  }
  if (meetingHasPassed(meeting)) {
    return res.status(400).json({ error: `The saved meeting (${meeting.event_date}) has already passed. Update it in the Meetings tab first.` })
  }

  let query = supabase.from('rsvps').select('name, email, role')
  if (targetRole && targetRole !== 'all') query = query.eq('role', targetRole)

  const { data: rsvps, error: fetchError } = await query
  if (fetchError) return res.status(500).json({ error: fetchError.message })

  const results = await Promise.allSettled(
    rsvps.map(({ name, email }) =>
      resend.emails.send({ from: EMAIL_FROM, to: email, subject: reminderSubject(meeting), html: buildReminderEmail(name, meeting) })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return res.status(200).json({ sent, failed, total: rsvps.length })
}
