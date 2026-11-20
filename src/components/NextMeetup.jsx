import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

// The saved meeting's date is free text typed by an admin ("Wednesday, May 20,
// 2026"). We only show it publicly when we can read it as a date that has not
// passed, so an old or unclear meeting never appears on the home page.
function upcoming(meeting) {
  if (!meeting?.event_date || !meeting?.event_time || !meeting?.location) return false
  const day = String(meeting.event_date).replace(/^[A-Za-z]+,\s*/, '')
  const when = new Date(`${day} ${meeting.event_time}`)
  if (isNaN(when)) return false
  return when.getTime() > Date.now() - 3 * 3600000
}

// The optional ticket link (for example a Valley Tickets page), only when it
// is a normal https address.
function ticketUrl(meeting) {
  const value = String(meeting?.ticket_url || '').trim()
  return /^https:\/\/\S+\.\S+$/.test(value) ? value : ''
}

export default function NextMeetup() {
  const [meeting, setMeeting] = useState(null)

  useEffect(() => {
    let active = true
    // `*` so this keeps working whether or not the optional ticket link
    // column is in the database yet.
    supabase
      .from('meeting_details')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (active && upcoming(data)) setMeeting(data)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (!meeting) return null

  return (
    <section className="home-section next-meetup" aria-labelledby="next-meetup-title">
      <div className="next-meetup-card">
        <div>
          <p className="eyebrow">Next meetup</p>
          <h2 className="next-meetup-title" id="next-meetup-title">{meeting.event_date}</h2>
          <p className="next-meetup-detail">{meeting.event_time} · {meeting.location}</p>
        </div>
        {ticketUrl(meeting) ? (
          <a href={ticketUrl(meeting)} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Get tickets
          </a>
        ) : (
          <a href="#join" className="btn btn-primary">Join to save your spot</a>
        )}
      </div>
    </section>
  )
}
