import { useState } from 'react'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_token', password)
      onLogin(password)
    } else {
      setError('Incorrect password.')
      setPassword('')
    }
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
            <button type="submit" className="submit-btn">Enter</button>
          </form>
        </div>
      </main>
    </div>
  )
}
