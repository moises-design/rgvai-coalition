import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Logo size={28} />
          <p className="site-footer-tagline">Connect. Collaborate. Innovate.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/" className="footer-nav-link">Home</Link>
          <Link to="/workshops" className="footer-nav-link">Workshops</Link>
          <Link to="/learn" className="footer-nav-link">Learn or teach</Link>
          <Link to="/showcase" className="footer-nav-link">Showcase</Link>
          <Link to="/digital-literacy" className="footer-nav-link">Digital Literacy</Link>
          <Link to="/ai-for-healthcare" className="footer-nav-link">AI for Healthcare</Link>
          <Link to="/support" className="footer-nav-link">Support us</Link>
          <Link to="/member" className="footer-nav-link">Member login</Link>
          <Link to="/privacy" className="footer-nav-link">Privacy</Link>
          <a href="mailto:hello@rgvaicoalition.com" className="footer-nav-link">Contact</a>
        </nav>
      </div>
      <p className="site-footer-legal">© 2026 RGV AI Coalition · Edinburg, TX</p>
    </footer>
  )
}
