import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const CATEGORY_COLORS = {
  article: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  tool:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  video:   { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  other:   { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

function CategoryBadge({ category }) {
  const s = CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
      color: s.color, background: s.bg, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {category}
    </span>
  )
}

function MemberLogin({ notice }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), checkRsvp: true }),
    })
    setLoading(false)
    if (!res.ok) {
      setError('no-rsvp')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="page">
        <header className="site-header">
          <Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>RGV AI</Link>
        </header>
        <main className="success-container">
          <div className="success-card">
            <div className="success-icon" aria-hidden="true">✦</div>
            <h1 className="success-title">Check your email</h1>
            <p className="success-body">
              We sent a login link to <strong>{email}</strong>.
              Click it to access your member page.
            </p>
            <p className="success-footer">Link expires in 1 hour. Didn't get it? Check spam or try again.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="site-header">
        <Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>RGV AI</Link>
      </header>
      <main className="success-container">
        <div className="admin-login-card">
          <div className="event-badge" style={{ marginBottom: '20px' }}>Member Portal</div>
          <h1 className="form-title" style={{ marginBottom: '6px' }}>Sign in</h1>
          <p className="form-subtitle" style={{ marginBottom: notice ? '16px' : '24px' }}>
            Enter the email you used to RSVP and we'll send you a magic link.
          </p>
          {notice && (
            <div className="member-notice" role="status">{notice}</div>
          )}
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="field-group">
              <label className="field-label" htmlFor="member-email">Email Address</label>
              <input
                id="member-email"
                type="email"
                className={`field-input${error ? ' field-error' : ''}`}
                placeholder="jane@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                autoComplete="email"
                autoFocus
              />
              {error && (
                <span className="error-msg">
                  {error === 'no-rsvp' ? (
                    <>No RSVP found for that email. <Link to="/" style={{ color: 'inherit', textDecoration: 'underline' }}>Sign up first →</Link></>
                  ) : error}
                </span>
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" aria-hidden="true" />
                  Sending…
                </span>
              ) : 'Send magic link →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function MemberContent({ session }) {
  const [rsvp, setRsvp] = useState(null)
  const [meeting, setMeeting] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [resources, setResources] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const email = session.user.email
      const [rsvpRes, meetingRes, announcementsRes, resourcesRes, confirmRes] = await Promise.all([
        supabase.from('rsvps').select('name, email, phone, ai_primary, ai_secondary, created_at')
          .eq('email', email).single(),
        supabase.from('meeting_details').select('*').eq('id', 1).single(),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
        fetch('/api/confirm-attendance', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then(r => r.json()),
      ])
      setRsvp(rsvpRes.data)
      setMeeting(meetingRes.data)
      setAnnouncements(announcementsRes.data || [])
      setResources(resourcesRes.data || [])
      setConfirmed(confirmRes.confirmed || false)
      setLoading(false)
    }
    loadData()
  }, [session.user.email])

  async function handleConfirm() {
    setConfirming(true)
    const res = await fetch('/api/confirm-attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email: session.user.email }),
    })
    if (res.ok) setConfirmed(true)
    setConfirming(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="page">
        <header className="site-header"><Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>RGV AI</Link></header>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Loading…</span>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="site-header" style={{ justifyContent: 'space-between' }}>
        <Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>RGV AI</Link>
        <button className="admin-btn" onClick={handleSignOut} style={{ fontSize: '0.78rem' }}>
          Sign out
        </button>
      </header>

      <main className="member-main">
        <div className="member-greeting">
          <div className="event-badge">Member Portal</div>
          <h1 className="hero-title" style={{ fontSize: '2rem', marginTop: '16px' }}>
            Welcome back{rsvp ? `, ${rsvp.name.split(' ')[0]}` : ''}.
          </h1>
        </div>

        <div className="member-grid">
          <div className="member-card">
            <h2 className="member-card-title">Next Meeting</h2>
            {meeting ? (
              <>
                <div className="event-details" style={{ gap: '12px' }}>
                  <div className="event-detail-item">
                    <span className="event-detail-icon" aria-hidden="true">◈</span>
                    <div>
                      <span className="event-detail-label">When</span>
                      <span className="event-detail-value">{meeting.event_date} · {meeting.event_time}</span>
                    </div>
                  </div>
                  <div className="event-detail-item">
                    <span className="event-detail-icon" aria-hidden="true">◈</span>
                    <div>
                      <span className="event-detail-label">Where</span>
                      <span className="event-detail-value">{meeting.location}</span>
                    </div>
                  </div>
                  {meeting.notes && (
                    <div className="event-detail-item">
                      <span className="event-detail-icon" aria-hidden="true">◈</span>
                      <div>
                        <span className="event-detail-label">Notes</span>
                        <span className="event-detail-value">{meeting.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {confirmed ? (
                    <div style={{ color: '#4ade80', fontSize: '0.88rem', fontWeight: 600 }}>
                      ✓ You're confirmed for this meeting
                    </div>
                  ) : (
                    <button
                      className="submit-btn"
                      style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                      onClick={handleConfirm}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <span className="btn-loading">
                          <span className="spinner" aria-hidden="true" />
                          Confirming…
                        </span>
                      ) : 'Confirm My Attendance →'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Details coming soon.</p>
            )}
          </div>

          <div className="member-card">
            <h2 className="member-card-title">Announcements</h2>
            {announcements.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No announcements yet.</p>
            ) : (
              <div className="announcement-list">
                {announcements.map(a => (
                  <div key={a.id} className="announcement-item">
                    <p className="announcement-title">{a.title}</p>
                    <p className="announcement-body">{a.body}</p>
                    <p className="announcement-date">
                      {new Date(a.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="member-card">
            <h2 className="member-card-title">Resource Library</h2>
            {resources.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No resources posted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {resources.map(r => (
                  <div key={r.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CategoryBadge category={r.category} />
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                      >
                        {r.title} →
                      </a>
                    </div>
                    {r.description && (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '0' }}>
                        {r.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {rsvp && (
            <div className="member-card">
              <h2 className="member-card-title">Your RSVP</h2>
              <div className="rsvp-info-grid">
                <div className="rsvp-info-item">
                  <span className="event-detail-label">Name</span>
                  <span className="event-detail-value">{rsvp.name}</span>
                </div>
                <div className="rsvp-info-item">
                  <span className="event-detail-label">Email</span>
                  <span className="event-detail-value">{rsvp.email}</span>
                </div>
                {rsvp.phone && (
                  <div className="rsvp-info-item">
                    <span className="event-detail-label">Phone</span>
                    <span className="event-detail-value">{rsvp.phone}</span>
                  </div>
                )}
                <div className="rsvp-info-item">
                  <span className="event-detail-label">Primary AI Tool</span>
                  <span className="event-detail-value">{rsvp.ai_primary}</span>
                </div>
                {rsvp.ai_secondary && (
                  <div className="rsvp-info-item">
                    <span className="event-detail-label">Secondary AI Tool</span>
                    <span className="event-detail-value">{rsvp.ai_secondary}</span>
                  </div>
                )}
                <div className="rsvp-info-item">
                  <span className="event-detail-label">Signed Up</span>
                  <span className="event-detail-value">
                    {new Date(rsvp.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function getUrlError() {
  const p = new URLSearchParams(window.location.search)
  const h = new URLSearchParams(window.location.hash.slice(1))
  return p.get('error_code') || h.get('error_code') || ''
}

export default function MemberPortal() {
  const [notice, setNotice] = useState(() => {
    const code = getUrlError()
    if (!code) return ''
    window.history.replaceState(null, '', '/member')
    return code === 'otp_expired'
      ? 'Your login link has expired. Enter your email to get a new one.'
      : 'This login link is invalid. Enter your email to get a new one.'
  })

  const [session, setSession] = useState(() => getUrlError() ? null : undefined)
  const wasSignedIn = useRef(false)
  const skipLoad = useRef(!!getUrlError())

  useEffect(() => {
    if (skipLoad.current) return

    let mounted = true

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      if (s) wasSignedIn.current = true
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return
      if (event === 'SIGNED_IN') {
        wasSignedIn.current = true
        setSession(s)
        window.history.replaceState(null, '', '/member')
      }
      if (event === 'SIGNED_OUT') {
        if (wasSignedIn.current) {
          setNotice('Your session expired. Enter your email to sign in again.')
        }
        setSession(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (session === undefined) return null
  if (!session) return <MemberLogin notice={notice} />
  return <MemberContent session={session} />
}
