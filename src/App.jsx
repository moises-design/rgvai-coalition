import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignupForm from './components/SignupForm'
import SuccessScreen from './components/SuccessScreen'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import MemberPortal from './components/MemberPortal'
import './App.css'

function HomePage() {
  const [registrant, setRegistrant] = useState(null)

  if (registrant) {
    return <SuccessScreen name={registrant.name} email={registrant.email} />
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
            Join the Rio Grande Valley's AI community for our first gathering builders, learners, and curious minds welcome.
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
                <span className="event-detail-value">Location TBD</span>
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <SignupForm onSuccess={setRegistrant} />
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 RGV AI Coalition · McAllen, TX</p>
      </footer>
    </div>
  )
}

function AdminRoute() {
  const stored = sessionStorage.getItem('admin_token')
  const [token, setToken] = useState(stored || '')

  if (!token) return <AdminLogin onLogin={setToken} />
  return <AdminDashboard token={token} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/member" element={<MemberPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
