import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/workshops', label: 'Workshops' },
  { to: '/digital-literacy', label: 'Digital Literacy' },
  { to: '/ai-for-healthcare', label: 'AI for Healthcare' },
]

export default function SiteHeader() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className={`site-header${open ? ' is-open' : ''}`}>
      <Logo />

      <button
        type="button"
        className="site-nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen(o => !o)}
      >
        <span className="site-nav-toggle-bars" aria-hidden="true" />
        <span className="afh-sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>

      <nav id="site-nav" className="site-nav" aria-label="Main navigation">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`site-nav-link${pathname === to ? ' active' : ''}`}
            aria-current={pathname === to ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link to="/member" className="site-nav-link" onClick={() => setOpen(false)}>
          Member login
        </Link>
        <Link to="/#join" className="site-nav-cta" onClick={() => setOpen(false)}>
          Join
        </Link>
      </nav>
    </header>
  )
}
