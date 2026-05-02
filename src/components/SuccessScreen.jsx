export default function SuccessScreen({ name, email }) {
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
            <p>We also sent a <strong>member portal link</strong> to your email — click it to see meeting details and announcements.</p>
          </div>
          <p className="success-footer">
            Share the word — the RGV AI Coalition is just getting started.
          </p>
        </div>
      </main>
    </div>
  )
}
