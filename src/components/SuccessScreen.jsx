import { useState } from 'react'
import { supabase } from '../supabase'

export default function SuccessScreen({ name, email }) {
  const [resendState, setResendState] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  async function handleResend() {
    setResendState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/member` },
    })
    setResendState(error ? 'error' : 'sent')
  }

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
