import { useRef } from 'react'
import { Link } from 'react-router-dom'

// A link card that leans toward the pointer in 3D. Mouse only; touch and
// reduced-motion visitors get a plain card (see .tilt in home.css).
export default function TiltCard({ to, className = '', children }) {
  const ref = useRef(null)

  function handleMove(e) {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    const box = el.getBoundingClientRect()
    const x = (e.clientX - box.left) / box.width
    const y = (e.clientY - box.top) / box.height
    el.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`)
    el.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`)
    el.style.setProperty('--glare-x', `${x * 100}%`)
    el.style.setProperty('--glare-y', `${y * 100}%`)
  }

  function handleLeave() {
    const el = ref.current
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <Link
      to={to}
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </Link>
  )
}
