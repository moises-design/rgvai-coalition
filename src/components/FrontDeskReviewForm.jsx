import { useState } from 'react'
import { WORKFLOW_OPTIONS } from '../data/aiForHealthcare'

const EMPTY = { name: '', clinic: '', email: '', phone: '', workflow: '', message: '', website: '' }

function validate(form) {
  const e = {}
  if (!form.name.trim()) e.name = 'Your name is required'
  if (!form.clinic.trim()) e.clinic = 'Clinic or practice name is required'
  if (!form.email.trim()) {
    e.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    e.email = 'Enter a valid email address'
  }
  if (form.phone.trim() && !/^\+?[\d\s\-().]{7,}$/.test(form.phone.trim())) {
    e.phone = 'Enter a valid phone number'
  }
  return e
}

export default function FrontDeskReviewForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validation = validate(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/front-desk-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setSent(true)
    } catch {
      setServerError('We could not send your request. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="afh-form-sent" role="status">
        <h3 className="afh-form-sent-title">Request received</h3>
        <p>Thanks, {form.name.trim()}. We will reach out to schedule your front desk review.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="signup-form">
      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="fdr-name">Your name</label>
          <input
            id="fdr-name" name="name" type="text" maxLength={120}
            className={`field-input${errors.name ? ' field-error' : ''}`}
            value={form.name} onChange={handleChange} autoComplete="name"
          />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="fdr-clinic">Clinic or practice</label>
          <input
            id="fdr-clinic" name="clinic" type="text" maxLength={160}
            className={`field-input${errors.clinic ? ' field-error' : ''}`}
            value={form.clinic} onChange={handleChange} autoComplete="organization"
          />
          {errors.clinic && <span className="error-msg">{errors.clinic}</span>}
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="fdr-email">Email</label>
          <input
            id="fdr-email" name="email" type="email" maxLength={200}
            className={`field-input${errors.email ? ' field-error' : ''}`}
            value={form.email} onChange={handleChange} autoComplete="email"
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="fdr-phone">
            Phone <span className="optional-tag">optional</span>
          </label>
          <input
            id="fdr-phone" name="phone" type="tel" maxLength={40}
            className={`field-input${errors.phone ? ' field-error' : ''}`}
            value={form.phone} onChange={handleChange} autoComplete="tel"
          />
          {errors.phone && <span className="error-msg">{errors.phone}</span>}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="fdr-workflow">
          Which workflow hurts most? <span className="optional-tag">optional</span>
        </label>
        <div className="select-wrapper">
          <select
            id="fdr-workflow" name="workflow"
            className="field-input field-select"
            value={form.workflow} onChange={handleChange}
          >
            <option value="">Select one…</option>
            {WORKFLOW_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="select-arrow" aria-hidden="true">▾</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="fdr-message">
          Anything we should know? <span className="optional-tag">optional</span>
        </label>
        <textarea
          id="fdr-message" name="message" rows={3} maxLength={1000}
          className="field-input afh-textarea"
          value={form.message} onChange={handleChange}
          aria-describedby="fdr-message-hint"
        />
        <span id="fdr-message-hint" className="afh-field-hint">
          Do not include patient names or any patient information.
        </span>
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="afh-hp" aria-hidden="true">
        <label htmlFor="fdr-website">Website</label>
        <input
          id="fdr-website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={form.website} onChange={handleChange}
        />
      </div>

      {serverError && (
        <div className="server-error" role="alert">{serverError}</div>
      )}

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? (
          <span className="btn-loading">
            <span className="spinner" aria-hidden="true" />
            Sending…
          </span>
        ) : 'Book your front desk review'}
      </button>

      <p className="form-privacy">
        We use these details only to contact you about your front desk review.
      </p>
    </form>
  )
}
