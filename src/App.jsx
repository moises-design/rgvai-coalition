import { useState } from 'react'
import { supabase } from './supabase'
import './App.css'

const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Copilot',
  'Grok',
  'Perplexity',
  'Midjourney',
  'n8n',
  'Make',
  'Flowise',
  'ElevenLabs',
  'Runway ML',
  'Cursor',
  'GitHub Copilot',
  'Other',
]

function App() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    ai_primary: '',
    ai_secondary: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address'
    }
    if (!form.phone.trim()) {
      e.phone = 'Cell number is required'
    } else if (!/^\+?[\d\s\-().]{7,}$/.test(form.phone)) {
      e.phone = 'Enter a valid phone number'
    }
    if (!form.ai_primary) e.ai_primary = 'Please select your favorite AI tool'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setSubmitting(true)
    setServerError('')
    const { error } = await supabase.from('rsvps').insert([
      {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        ai_primary: form.ai_primary,
        ai_secondary: form.ai_secondary || null,
      },
    ])
    setSubmitting(false)
    if (error) {
      if (error.code === '23505') {
        setServerError('This email is already registered. See you there!')
      } else {
        setServerError('Something went wrong. Please try again.')
      }
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="page">
        <header className="site-header">
          <span className="logo-badge">RGV AI</span>
        </header>
        <main className="success-container">
          <div className="success-card">
            <div className="success-icon" aria-hidden="true">✦</div>
            <h1 className="success-title">You're on the list!</h1>
            <p className="success-body">
              We'll see you <strong>Wednesday, May 20, 2026 at 7:00 PM</strong> in McAllen, TX.
              We'll send location details as the date gets closer.
            </p>
            <div className="success-detail">
              <span className="detail-label">Registered as</span>
              <span className="detail-value">{form.name}</span>
            </div>
            <div className="success-detail">
              <span className="detail-label">Confirmation sent to</span>
              <span className="detail-value">{form.email}</span>
            </div>
            <p className="success-footer">
              Share the word — the RGV AI Coalition is just getting started.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="site-header">
        <span className="logo-badge">RGV AI</span>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="event-badge">Save the Date</div>
          <h1 className="hero-title">
            RGV AI<br />
            <span className="hero-accent">Coalition</span>
          </h1>
          <p className="hero-subtitle">
            Join the Rio Grande Valley's AI community for our first gathering —
            builders, learners, and curious minds welcome.
          </p>

          <div className="event-details">
            <div className="event-detail-item">
              <span className="event-detail-icon" aria-hidden="true">◈</span>
              <div>
                <span className="event-detail-label">When</span>
                <span className="event-detail-value">Wednesday, May 20, 2026 · 7:00 PM</span>
              </div>
            </div>
            <div className="event-detail-item">
              <span className="event-detail-icon" aria-hidden="true">◈</span>
              <div>
                <span className="event-detail-label">Where</span>
                <span className="event-detail-value">McAllen, TX · Location TBD</span>
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Reserve your spot</h2>
              <p className="form-subtitle">Free to attend — just let us know you're coming.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="signup-form">
              <div className="field-group">
                <label className="field-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`field-input${errors.name ? ' field-error' : ''}`}
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`field-input${errors.email ? ' field-error' : ''}`}
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="phone">Cell Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`field-input${errors.phone ? ' field-error' : ''}`}
                  placeholder="(956) 555-0100"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="ai_primary">Favorite AI Tool</label>
                  <div className="select-wrapper">
                    <select
                      id="ai_primary"
                      name="ai_primary"
                      className={`field-input field-select${errors.ai_primary ? ' field-error' : ''}`}
                      value={form.ai_primary}
                      onChange={handleChange}
                    >
                      <option value="">Select a tool…</option>
                      {AI_TOOLS.map(tool => (
                        <option key={tool} value={tool}>{tool}</option>
                      ))}
                    </select>
                    <span className="select-arrow" aria-hidden="true">▾</span>
                  </div>
                  {errors.ai_primary && <span className="error-msg">{errors.ai_primary}</span>}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="ai_secondary">
                    Another AI Tool <span className="optional-tag">optional</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="ai_secondary"
                      name="ai_secondary"
                      className="field-input field-select"
                      value={form.ai_secondary}
                      onChange={handleChange}
                    >
                      <option value="">Select a tool…</option>
                      {AI_TOOLS.filter(t => t !== form.ai_primary).map(tool => (
                        <option key={tool} value={tool}>{tool}</option>
                      ))}
                    </select>
                    <span className="select-arrow" aria-hidden="true">▾</span>
                  </div>
                </div>
              </div>

              {serverError && (
                <div className="server-error" role="alert">{serverError}</div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true" />
                    Saving…
                  </span>
                ) : (
                  "Count me in →"
                )}
              </button>

              <p className="form-privacy">
                No spam, ever. Just event updates.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 RGV AI Coalition · McAllen, TX</p>
      </footer>
    </div>
  )
}

export default App
