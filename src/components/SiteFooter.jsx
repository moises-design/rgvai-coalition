import { Link } from 'react-router-dom'

const FOOTER_SECTIONS = [
  {
    title: 'Learn',
    links: [
      { to: '/learn/courses', label: 'Courses' },
      { to: '/learn/paths', label: 'Learning paths' },
      { to: '/learn', label: 'Learn hub' },
    ],
  },
  {
    title: 'Community',
    links: [
      { to: '/community/government', label: 'Government' },
      { to: '/community/educators', label: 'Educators' },
      { to: '/community/volunteer', label: 'Volunteer' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { to: '/resources/news', label: 'AI news' },
      { to: '/resources/prompts', label: 'Prompt library' },
      { to: '/resources/tools', label: 'Tool directory' },
    ],
  },
  {
    title: 'About',
    links: [
      { to: '/about', label: 'Mission' },
      { to: '/about/partner', label: 'Become a partner' },
      { to: '/about/contact', label: 'Contact' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer className="site-footer platform-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-logo">RGV AI Coalition</p>
          <p className="footer-tagline">South Texas&apos;s AI learning and workforce development platform.</p>
        </div>
        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="footer-col">
            <p className="footer-col-title">{section.title}</p>
            <ul>
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2026 RGV AI Coalition · Edinburg, TX</p>
        <p>
          <Link to="/about/contact">Accessibility</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/about/contact">Privacy</Link>
        </p>
      </div>
    </footer>
  )
}
