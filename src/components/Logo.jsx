import { useId } from 'react'
import { Link } from 'react-router-dom'

// The mark: a "V" for the Valley that also reads as a person with arms raised.
export function LogoMark({ size = 32, className = '' }) {
  const id = useId()
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="8" y1="60" x2="58" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1557ff" />
          <stop offset="0.5" stopColor="#7a4dff" />
          <stop offset="1" stopColor="#ff7a59" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id})`} />
      <path
        d="M17 24 L32 48 L47 24"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="18" r="5.5" fill="#fff" />
    </svg>
  )
}

export default function Logo({ size = 32, linked = true }) {
  const content = (
    <>
      <LogoMark size={size} />
      <span className="logo-wordmark">
        RGV AI <span className="logo-wordmark-soft">Coalition</span>
      </span>
    </>
  )

  if (!linked) return <span className="logo">{content}</span>
  return (
    <Link to="/" className="logo" aria-label="RGV AI Coalition, home">
      {content}
    </Link>
  )
}
