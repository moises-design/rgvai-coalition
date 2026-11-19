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

export default function NextMeetup() {
  const [meeting, setMeeting] = useState(null)

  useEffect(() => {
    let active = true
    supabase
      .from('meeting_details')
      .select('event_date, event_time, location')
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
        <a href="#join" className="btn btn-primary">Join to save your spot</a>
      </div>
    </section>
  )
}
