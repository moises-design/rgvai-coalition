import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildReminderEmail, meetingHasPassed, reminderSubject } from './_email.js'
import { ADMIN, SUPER, interestLink, requireAdmin, unsubscribeHeaders, unsubscribeLinks } from './_guard.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = 'RGV AI Coalition <hello@rgvaicoalition.com>'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!await requireAdmin(supabase, req, res, 'x-admin-token', [ADMIN(), SUPER()])) return

  const { targetRole } = req.body || {}

  // The email is built from the saved meeting, so there must be a current one.
  const { data: meeting } = await supabase.from('meeting_details').select('*').eq('id', 1).single()
  if (!meeting) {
    return res.status(400).json({ error: 'No meeting is set. Add the next meeting in the Meetings tab first.' })
  }
  if (meetingHasPassed(meeting)) {
    return res.status(400).json({ error: `The saved meeting (${meeting.event_date}) has already passed. Update it in the Meetings tab first.` })
  }

  const load = columns => {
    let query = supabase.from('rsvps').select(columns)
    if (targetRole && targetRole !== 'all') query = query.eq('role', targetRole)
    return query
  }
  let { data: rsvps, error: fetchError } = await load('name, email, role, email_opt_out')
  if (fetchError?.code === '42703') {
    // The opt-out column is not in the database yet: nobody can have opted out.
    ;({ data: rsvps, error: fetchError } = await load('name, email, role'))
  }
  if (fetchError) return res.status(500).json({ error: fetchError.message })

  // The topic buttons go in only when the Learn or teach board's table exists,
  // so an email never points at a board that cannot save an answer.
  const { error: boardError } = await supabase.from('topic_interest').select('voter_key', { count: 'exact', head: true })
  const boardOpen = !boardError

  // Members who unsubscribed are never emailed.
  const recipients = rsvps.filter(member => !member.email_opt_out)

  const results = await Promise.allSettled(
    recipients.map(({ name, email }) =>
      resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: reminderSubject(meeting),
        html: buildReminderEmail(name, meeting, unsubscribeLinks(email).page, boardOpen ? topic => interestLink(email, topic) : undefined),
        headers: unsubscribeHeaders(email),
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled' && !r.value?.error).length
  const failed = results.length - sent
  return res.status(200).json({ sent, failed, total: recipients.length, unsubscribed: rsvps.length - recipients.length })
}
