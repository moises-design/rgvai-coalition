import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignupForm from './components/SignupForm'
import SuccessScreen from './components/SuccessScreen'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import MemberPortal from './components/MemberPortal'
import SuperAdminLogin from './components/SuperAdminLogin'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import DigitalLiteracyPage from './components/DigitalLiteracyPage'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import usePageMeta from './hooks/usePageMeta'
import './App.css'

function HomePage() {
  const [registrant, setRegistrant] = useState(null)

  usePageMeta({
    title: 'RGV AI Coalition — Save the Date · May 20, 2026',
    description: 'Save the date — RGV AI Coalition first gathering, Wednesday May 20, 2026 at 7:00 PM in Edinburg, TX.',
    ogTitle: 'RGV AI Coalition — Connect. Collaborate. Innovate.',
    ogDescription: "Join the Rio Grande Valley's AI community. Wednesday May 20, 2026 · 7:00 PM · Edinburg, TX",
    path: '/',
  })

  if (registrant) {
    return <SuccessScreen name={registrant.name} email={registrant.email} />
  }

  return (
    <div className="page">
      <SiteHeader />

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
                <span className="event-detail-value">Wednesday, May 20, 2026 · 7:00 PM – 8:30 PM</span>
              </div>
            </div>
            <div className="event-detail-item">
              <span className="event-detail-icon" aria-hidden="true">◈</span>
              <div>
                <span className="event-detail-label">Where</span>
                <div>
                  <span className="event-detail-value">The Dog Stadium</span>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    1402 N Closner Blvd, Ste A, Edinburg, TX 78541
                  </span>
                  <a
                    href="https://maps.google.com/?q=1402+N+Closner+Blvd+Edinburg+TX+78541"
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--cyan)', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}
                  >
                    Open in Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <SignupForm onSuccess={setRegistrant} />
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <img
              src="/flyer.png"
              alt="RGV AI Coalition Event Flyer"
              style={{
                width: '100%',
                maxWidth: '500px',
                borderRadius: '12px',
                display: 'block',
                margin: '0 auto',
              }}
            />
            <p style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Share with someone who should be here
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function AdminRoute() {
  const stored = sessionStorage.getItem('admin_token')
  const [token, setToken] = useState(stored || '')

  if (!token) return <AdminLogin onLogin={setToken} />
  return <AdminDashboard token={token} />
}

function SuperAdminRoute() {
  const stored = sessionStorage.getItem('superadmin_token')
  const [token, setToken] = useState(stored || '')

  if (!token) return <SuperAdminLogin onLogin={setToken} />
  return <SuperAdminDashboard token={token} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/digital-literacy" element={<DigitalLiteracyPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/superadmin" element={<SuperAdminRoute />} />
        <Route path="/member" element={<MemberPortal />} />
      </Routes>
    </BrowserRouter>
  )
}
