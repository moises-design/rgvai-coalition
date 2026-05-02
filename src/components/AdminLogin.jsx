import { useState } from 'react'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (!res.ok) {
      setError('Incorrect password.')
      setPassword('')
      return
    }
    sessionStorage.setItem('admin_token', password)
    onLogin(password)
  }

  return (
    <div className="page">
      <header className="site-header">
        <span className="logo-badge">RGV AI</span>
      </header>
      <main className="success-container">
        <div className="admin-login-card">
          <h1 className="form-title" style={{ marginBottom: '6px' }}>Admin Access</h1>
          <p className="form-subtitle" style={{ marginBottom: '24px' }}>Enter the admin password to continue.</p>
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="field-group">
              <label className="field-label" htmlFor="admin-pass">Password</label>
              <input
                id="admin-pass"
                type="password"
                className={`field-input${error ? ' field-error' : ''}`}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoFocus
              />
              {error && <span className="error-msg">{error}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" aria-hidden="true" />
                  Checking…
                </span>
              ) : 'Enter'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
