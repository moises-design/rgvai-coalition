import { useState } from 'react'

export default function SuccessScreen({ name, email }) {
  const [resendState, setResendState] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  async function handleResend() {
    setResendState('sending')
    const res = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResendState(res.ok ? 'sent' : 'error')
  }

  return (
    <div className="page">
      <header className="site-header">
        <span className="logo-badge">RGV AI</span>
      </header>
      <main className="success-container">
        <div className="success-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img src="/rgvai-logo.png" alt="RGV AI Coalition" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          </div>
          <h1 className="success-title">You're on the list!</h1>
          <p className="success-body">
            We'll see you <strong>Wednesday, May 20, 2026 at 7:00 PM – 8:30 PM</strong> at{' '}
            <strong>The Dog Stadium</strong>, 1402 N Closner Blvd, Ste A, Edinburg, TX 78541.
          </p>
          <div className="success-detail">
            <span className="detail-label">Registered as</span>
            <span className="detail-value">{name}</span>
          </div>
          <div className="success-detail">
            <span className="detail-label">Confirmation sent to</span>
            <span className="detail-value">{email}</span>
          </div>
          <div className="success-magic-link-note">
            <span className="event-detail-icon" aria-hidden="true">◈</span>
            <div style={{ flex: 1 }}>
              <p>We also sent a <strong>member portal link</strong> to your email — click it to see meeting details and announcements.</p>
              <div style={{ marginTop: '10px', fontSize: '0.82rem' }}>
                {resendState === 'idle' && (
                  <span>Didn't get it? <button className="resend-link-btn" onClick={handleResend}>Resend it</button></span>
                )}
                {resendState === 'sending' && (
                  <span style={{ color: 'var(--text-muted)' }}>Resending…</span>
                )}
                {resendState === 'sent' && (
                  <span style={{ color: 'var(--cyan)' }}>✓ New link sent — check your inbox.</span>
                )}
                {resendState === 'error' && (
                  <span style={{ color: 'var(--error)' }}>Couldn't resend. Visit the <a href="/member" style={{ color: 'var(--cyan)' }}>member page</a> to request a new link.</span>
                )}
              </div>
            </div>
          </div>
          <p className="success-footer">
            Share the word — the RGV AI Coalition is just getting started.
          </p>
        </div>
      </main>
    </div>
  )
}
