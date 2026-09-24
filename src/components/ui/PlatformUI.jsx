import { Link } from 'react-router-dom'

export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function Button({ children, to, href, variant = 'primary', className = '', onClick, type = 'button', ...rest }) {
  const cls = `platform-btn platform-btn--${variant} ${className}`.trim()

  if (to) {
    return <Link to={to} className={cls} {...rest}>{children}</Link>
  }
  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:')
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    )
  }
  return <button type={type} className={cls} onClick={onClick} {...rest}>{children}</button>
}

export function Card({ children, className = '', as: Tag = 'article' }) {
  return <Tag className={`platform-card ${className}`.trim()}>{children}</Tag>
}

export function StatGrid({ stats }) {
  return (
    <div className="stat-grid" role="list">
      {stats.map((s) => (
        <div key={s.label} className="stat-item" role="listitem">
          <p className="stat-value">{s.value}</p>
          <p className="stat-label">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export function FaqList({ items }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question} className="faq-item">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-desc">{description}</p>
      {action}
    </div>
  )
}
