import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/digital-literacy', label: 'Digital Literacy' },
]

export default function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="site-header">
      <Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>
        RGV AI
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`site-nav-link${pathname === to ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
        <Link to="/member" className="admin-btn site-nav-login">
          Member login
        </Link>
      </nav>
    </header>
  )
}
