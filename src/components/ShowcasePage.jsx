import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

const EMPTY = { title: '', url: '', blurb: '', name: '', email: '', website: '' }

// Only a normal https address is ever turned into a link.
function safeLink(value) {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function host(value) {
  try { return new URL(value).hostname.replace(/^www\./, '') } catch { return '' }
}

// "Show what you built": projects from people in the Valley. Anyone can send
// one without an account; each appears only after an admin approves it.
export default function ShowcasePage() {
  const [entries, setEntries] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [state, setState] = useState('idle') // idle | working | done | error
  const [message, setMessage] = useState('')

  usePageMeta({
    title: 'Built in the Valley — RGV AI Coalition',
    description: 'Projects built with AI by people in the Rio Grande Valley. Share yours, no account needed.',
    ogTitle: 'Built in the Valley, with AI',
    path: '/showcase',
  })

  useEffect(() => {
    let active = true
    fetch('/api/showcase')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!active) return
        if (data?.open === false) setOpen(false)
        setEntries((data?.entries || []).filter(entry => safeLink(entry.url)))
        setLoaded(true)
      })
      .catch(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [])

  const set = field => e => { setForm(prev => ({ ...prev, [field]: e.target.value })); if (state === 'error') setState('idle') }

  async function submit(e) {
    e.preventDefault()
    setState('working')
    try {
      const res = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'Something went wrong. Please try again.')
        setState('error')
        return
      }
      setForm(EMPTY)
      setState('done')
    } catch {
      setMessage('Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <div className="page">
      <SiteHeader />

      <main className="dl-main">
        <section className="dl-hero">
          <div className="event-badge">Showcase</div>
          <h1 className="dl-hero-title">Built in the Valley, with AI.</h1>
          <p className="dl-hero-subtitle">
            Apps, automations and experiments from people here. Show yours in a minute, with no account.
          </p>
          <div className="dl-cta-group">
            <a href="#share" className="cta-btn-primary">Show what you built</a>
            <Link to="/learn" className="cta-btn-secondary">Tell us what to teach next</Link>
          </div>
        </section>

        <section className="dl-section" aria-labelledby="projects-title">
          <h2 className="dl-section-title" id="projects-title">Projects</h2>
          {!loaded ? (
            <p className="dl-section-lead">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="dl-section-lead">Nothing here yet. Yours could be the first.</p>
          ) : (
            <div className="dl-card-grid ws-grid">
              {entries.map(entry => (
                <article key={entry.id} className="dl-info-card ws-card">
                  <h3 className="dl-card-title">{entry.title}</h3>
                  <p className="dl-card-body">{entry.blurb}</p>
                  {entry.builder_name && <p className="sc-by">By {entry.builder_name}</p>}
                  <a href={safeLink(entry.url)} className="ws-link" target="_blank" rel="noopener noreferrer nofollow ugc">
                    {host(entry.url)} →
                  </a>
                </article>
              ))}
            </div>
          )}
          <p className="sc-note">
            These links go to other people’s sites. We look at each one before it appears, but we do not run them.
          </p>
        </section>

        <section className="dl-section" id="share" aria-labelledby="share-title">
          <div className="dl-mission-card">
            <h2 className="dl-section-title" id="share-title">Show what you built</h2>
            {!open ? (
              <p>The showcase opens soon. Please check back.</p>
            ) : state === 'done' ? (
              <div role="status">
                <p><strong>Thank you. We got it.</strong> It will appear here after we take a look.</p>
                <button type="button" className="cta-btn-secondary sc-again" onClick={() => setState('idle')}>
                  Add another
                </button>
              </div>
            ) : (
              <form className="sc-form" onSubmit={submit} noValidate>
                <p>A link and one sentence. It appears after we take a look.</p>
                <div className="field-group">
                  <label className="field-label" htmlFor="sc-title">Project name</label>
                  <input id="sc-title" className="field-input" maxLength={80} required value={form.title} onChange={set('title')} />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="sc-url">Link</label>
                  <input id="sc-url" type="url" className="field-input" maxLength={300} required value={form.url}
                    onChange={set('url')} placeholder="https://" />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="sc-blurb">What does it do? <span className="optional-tag">one sentence</span></label>
                  <input id="sc-blurb" className="field-input" maxLength={200} required value={form.blurb} onChange={set('blurb')} />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="sc-name">Your name <span className="optional-tag">optional, shown</span></label>
                    <input id="sc-name" className="field-input" maxLength={60} autoComplete="name" value={form.name} onChange={set('name')} />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="sc-email">Email <span className="optional-tag">optional, never shown</span></label>
                    <input id="sc-email" type="email" className="field-input" maxLength={200} autoComplete="email" value={form.email} onChange={set('email')} />
                  </div>
                </div>
                {/* Hidden from people; only automated form fillers complete it. */}
                <div className="sc-trap" aria-hidden="true">
                  <label htmlFor="sc-website">Website</label>
                  <input id="sc-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                </div>
                {state === 'error' && <div className="server-error" role="alert">{message}</div>}
                <button type="submit" className="cta-btn-primary sc-send" disabled={state === 'working'}>
                  {state === 'working' ? 'Sending…' : 'Send it in'}
                </button>
                <p className="sc-note">
                  Share only work you are allowed to show, with no customer or patient details. <Link to="/privacy">Privacy</Link>
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
