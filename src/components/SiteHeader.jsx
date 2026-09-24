import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  {
    label: 'Learn',
    base: '/learn',
    items: [
      { to: '/learn', label: 'Learn hub' },
      { to: '/learn/courses', label: 'Courses' },
      { to: '/learn/paths', label: 'Learning paths' },
    ],
  },
  {
    label: 'Events',
    base: '/events',
    items: [{ to: '/events', label: 'Workshop calendar' }],
  },
  {
    label: 'Community',
    base: '/community',
    items: [
      { to: '/community/partners', label: 'Partner organizations' },
      { to: '/community/government', label: 'Cities & government' },
      { to: '/community/educators', label: 'Educators' },
      { to: '/community/small-business', label: 'Small business' },
      { to: '/community/nonprofits', label: 'Nonprofits' },
      { to: '/community/volunteer', label: 'Volunteer' },
    ],
  },
  {
    label: 'Resources',
    base: '/resources',
    items: [
      { to: '/resources/news', label: 'AI news' },
      { to: '/resources/prompts', label: 'Prompt library' },
      { to: '/resources/downloads', label: 'Downloads' },
      { to: '/resources/tools', label: 'Tool directory' },
    ],
  },
  {
    label: 'About',
    base: '/about',
    items: [
      { to: '/about', label: 'Mission' },
      { to: '/about/sponsors', label: 'Sponsors' },
      { to: '/about/partner', label: 'Become a partner' },
      { to: '/about/contact', label: 'Contact' },
    ],
  },
]

function isActive(pathname, base) {
  return pathname === base || pathname.startsWith(`${base}/`)
}

export default function SiteHeader() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)

  return (
    <header className="site-header platform-header">
      <Link to="/" className="logo-badge logo-link" onClick={() => setMobileOpen(false)}>
        RGV AI Coalition
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <span className="visually-hidden">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
        <span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
      </button>

      <nav
        id="primary-navigation"
        className={`site-nav platform-nav${mobileOpen ? ' open' : ''}`}
        aria-label="Main navigation"
      >
        {NAV.map((group) => (
          <div key={group.label} className="nav-group">
            <button
              type="button"
              className={`nav-group-trigger${isActive(pathname, group.base) ? ' active' : ''}`}
              aria-expanded={openMenu === group.label}
              onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
            >
              {group.label}
            </button>
            <div className={`nav-dropdown${openMenu === group.label || mobileOpen ? ' open' : ''}`}>
              {group.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-dropdown-link${pathname === item.to ? ' active' : ''}`}
                  onClick={() => { setMobileOpen(false); setOpenMenu(null) }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <Link to="/member" className="platform-btn platform-btn--secondary nav-signin" onClick={() => setMobileOpen(false)}>
          Sign in
        </Link>
      </nav>
    </header>
  )
}
