import { useState } from 'react'

const EMAIL = 'hello@rgvaicoalition.com'

export default function ContactForm({ subject, fields = ['name', 'email', 'organization', 'message'], submitLabel = 'Send message' }) {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '', phone: '', program: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  function validate() {
    const next = {}
    if (fields.includes('name') && !form.name.trim()) next.name = 'Name is required'
    if (fields.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Valid email is required'
    if (fields.includes('message') && form.message.trim().length < 10) next.message = 'Please include a brief message (10+ characters)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const body = fields
      .map((f) => `${f.charAt(0).toUpperCase() + f.slice(1)}: ${form[f] || '—'}`)
      .join('\n')

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  if (sent) {
    return (
      <div className="form-success" role="status">
        <p>Your email client should open with your message ready to send. If it did not open, email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
      </div>
    )
  }

  return (
    <form className="platform-form" onSubmit={handleSubmit} noValidate>
      {fields.includes('name') && (
        <div className="field-group">
          <label htmlFor="cf-name">Full name</label>
          <input id="cf-name" className={errors.name ? 'field-error' : ''} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          {errors.name && <span className="error-msg">{errors.name}</span>}
        </div>
      )}
      {fields.includes('email') && (
        <div className="field-group">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" className={errors.email ? 'field-error' : ''} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>
      )}
      {fields.includes('organization') && (
        <div className="field-group">
          <label htmlFor="cf-org">Organization</label>
          <input id="cf-org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
        </div>
      )}
      {fields.includes('phone') && (
        <div className="field-group">
          <label htmlFor="cf-phone">Phone <span className="optional-tag">optional</span></label>
          <input id="cf-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      )}
      {fields.includes('program') && (
        <div className="field-group">
          <label htmlFor="cf-program">Program of interest</label>
          <input id="cf-program" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} />
        </div>
      )}
      {fields.includes('message') && (
        <div className="field-group">
          <label htmlFor="cf-message">Message</label>
          <textarea id="cf-message" rows={5} className={errors.message ? 'field-error' : ''} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          {errors.message && <span className="error-msg">{errors.message}</span>}
        </div>
      )}
      <input type="text" name="company" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="platform-btn platform-btn--primary">{submitLabel}</button>
    </form>
  )
}
