import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="footer-nav" aria-label="Footer navigation">
        <Link to="/" className="footer-nav-link">Home</Link>
        <span className="footer-nav-sep" aria-hidden="true">·</span>
        <Link to="/digital-literacy" className="footer-nav-link">Digital Literacy</Link>
        <span className="footer-nav-sep" aria-hidden="true">·</span>
        <Link to="/member" className="footer-nav-link">Member login</Link>
      </nav>
      <p>© 2026 RGV AI Coalition · Edinburg, TX</p>
    </footer>
  )
}
