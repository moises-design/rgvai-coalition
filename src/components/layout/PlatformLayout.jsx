import { Link } from 'react-router-dom'

export default function AppShell({ children, className = '' }) {
  return (
    <div className={`page ${className}`.trim()}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {children}
    </div>
  )
}

export function PageLayout({ children, width = 'default' }) {
  return (
    <main id="main-content" className={`platform-main platform-main--${width}`}>
      {children}
    </main>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
      <div className="page-header-row">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </header>
  )
}

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.to && i < items.length - 1 ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Section({ title, description, children, id }) {
  return (
    <section className="platform-section" id={id}>
      {(title || description) && (
        <div className="section-heading">
          {title && <h2 className="section-title">{title}</h2>}
          {description && <p className="section-description">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
