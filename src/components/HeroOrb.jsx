import { useEffect, useRef } from 'react'

// A small dependency-free 3D scene: points on a sphere, joined to their
// neighbours, with signals travelling along the links. Drawn on a 2D canvas
// with our own rotation and perspective so the page stays light and fast.

const POINTS = 240
const NEIGHBOURS = 3
const PULSES = 16
const CAMERA = 3.4
const LABELS = ['Connect', 'Collaborate', 'Innovate']

// Brand gradient stops (blue, violet, coral), matched to the logo.
const STOPS = [
  [21, 87, 255],
  [122, 77, 255],
  [255, 122, 89],
]
const SHADES = 24
const PALETTE = Array.from({ length: SHADES }, (_, i) => {
  const t = (i / (SHADES - 1)) * (STOPS.length - 1)
  const a = STOPS[Math.floor(t)]
  const b = STOPS[Math.min(STOPS.length - 1, Math.floor(t) + 1)]
  const f = t - Math.floor(t)
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f))
  return `rgb(${c[0]},${c[1]},${c[2]})`
})

function buildScene() {
  const pts = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < POINTS; i++) {
    const y = 1 - (i / (POINTS - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * golden
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r])
  }

  const edges = []
  const seen = new Set()
  const byNode = pts.map(() => [])
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2])
      .filter(([j]) => j !== i)
      .sort((m, n) => m[1] - n[1])
      .slice(0, NEIGHBOURS)
    near.forEach(([j]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) return
      seen.add(key)
      byNode[i].push(edges.length)
      byNode[j].push(edges.length)
      edges.push([i, j])
    })
  })

  // Label anchors float just outside the sphere, a third of a turn apart.
  const anchors = LABELS.map((_, i) => {
    const lon = (i / LABELS.length) * Math.PI * 2
    const lat = [0.38, -0.3, 0.05][i]
    const r = 1.15
    return [Math.cos(lon) * Math.cos(lat) * r, Math.sin(lat) * r, Math.sin(lon) * Math.cos(lat) * r]
  })

  return { pts, edges, byNode, anchors }
}

export default function HeroOrb() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const labelRefs = useRef([])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const { pts, edges, byNode, anchors } = buildScene()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const proj = pts.map(() => ({ x: 0, y: 0, z: 0, s: 1 }))
    const order = pts.map((_, i) => i)
    const pulses = Array.from({ length: PULSES }, () => {
      const e = Math.floor(Math.random() * edges.length)
      return { e, from: edges[e][0], t: Math.random(), speed: 0.5 + Math.random() * 0.7 }
    })

    let size = 0
    let dpr = 1
    let yaw = 0.6
    let tiltX = 0
    let tiltY = 0
    let targetX = 0
    let targetY = 0
    let visible = true
    let frame = 0
    let last = 0

    function resize() {
      size = wrap.clientWidth
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      if (reduced) draw()
    }

    function project(p, out, cy, sy, cx, sx, radius, centre) {
      // rotate around Y (yaw), then X (pitch)
      const x1 = p[0] * cy + p[2] * sy
      const z1 = -p[0] * sy + p[2] * cy
      const y2 = p[1] * cx - z1 * sx
      const z2 = p[1] * sx + z1 * cx
      const s = CAMERA / (CAMERA - z2)
      out.x = centre + x1 * radius * s
      out.y = centre - y2 * radius * s
      out.z = z2
      out.s = s
    }

    function shade(o) {
      // colour by screen position so the orb always matches the logo:
      // blue bottom-left, coral top-right
      const t = ((o.x - o.y) / (size * dpr) + 1) / 2
      return PALETTE[Math.max(0, Math.min(SHADES - 1, Math.round(t * 1.5 * (SHADES - 1) - (SHADES - 1) * 0.25)))]
    }

    function draw() {
      const w = size * dpr
      const centre = w / 2
      const radius = w * 0.33
      const pitch = 0.32 + tiltY
      const a = yaw + tiltX
      const cy = Math.cos(a)
      const sy = Math.sin(a)
      const cx = Math.cos(pitch)
      const sx = Math.sin(pitch)

      ctx.clearRect(0, 0, w, w)
      for (let i = 0; i < pts.length; i++) project(pts[i], proj[i], cy, sy, cx, sx, radius, centre)

      ctx.lineWidth = dpr
      for (let i = 0; i < edges.length; i++) {
        const p = proj[edges[i][0]]
        const q = proj[edges[i][1]]
        const depth = ((p.z + q.z) / 2 + 1) / 2
        ctx.globalAlpha = 0.05 + 0.3 * depth * depth
        ctx.strokeStyle = shade(p)
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(q.x, q.y)
        ctx.stroke()
      }

      order.sort((m, n) => proj[m].z - proj[n].z)
      for (let k = 0; k < order.length; k++) {
        const p = proj[order[k]]
        const depth = (p.z + 1) / 2
        ctx.globalAlpha = 0.18 + 0.82 * depth
        ctx.fillStyle = shade(p)
        ctx.beginPath()
        ctx.arc(p.x, p.y, (0.9 + 2.1 * depth) * p.s * dpr, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let k = 0; k < pulses.length; k++) {
        const pulse = pulses[k]
        const [i, j] = edges[pulse.e]
        const p = proj[pulse.from]
        const q = proj[pulse.from === i ? j : i]
        const x = p.x + (q.x - p.x) * pulse.t
        const y = p.y + (q.y - p.y) * pulse.t
        const depth = ((p.z + (q.z - p.z) * pulse.t) + 1) / 2
        if (depth < 0.35) continue
        const r = (2.2 + 2.4 * depth) * dpr
        ctx.fillStyle = shade(p)
        ctx.globalAlpha = 0.16 * depth
        ctx.beginPath()
        ctx.arc(x, y, r * 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = depth
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const out = { x: 0, y: 0, z: 0, s: 1 }
      anchors.forEach((anchor, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        project(anchor, out, cy, sy, cx, sx, radius, centre)
        const depth = Math.max(0, Math.min(1, (out.z + 1.15) / 2.3))
        el.style.transform =
          `translate3d(${out.x / dpr}px, ${out.y / dpr}px, 0) translate(-50%, -50%) scale(${0.72 + 0.4 * depth})`
        el.style.opacity = String(depth * depth)
        el.style.zIndex = out.z > 0 ? '2' : '0'
      })
    }

    function tick(now) {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000 || 0)
      last = now
      yaw += dt * 0.16
      tiltX += (targetX - tiltX) * Math.min(1, dt * 4)
      tiltY += (targetY - tiltY) * Math.min(1, dt * 4)
      for (let k = 0; k < pulses.length; k++) {
        const pulse = pulses[k]
        pulse.t += dt * pulse.speed
        if (pulse.t >= 1) {
          // hop onto another link from the node we just reached
          const [i, j] = edges[pulse.e]
          const at = pulse.from === i ? j : i
          const options = byNode[at]
          pulse.e = options[Math.floor(Math.random() * options.length)]
          pulse.from = at
          pulse.t = 0
        }
      }
      draw()
    }

    function start() {
      if (reduced || frame || !visible || document.hidden) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
    }

    function onPointer(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return
      const box = wrap.getBoundingClientRect()
      const dx = (e.clientX - (box.left + box.width / 2)) / window.innerWidth
      const dy = (e.clientY - (box.top + box.height / 2)) / window.innerHeight
      targetX = Math.max(-0.6, Math.min(0.6, dx * 1.2))
      targetY = Math.max(-0.35, Math.min(0.35, dy * 0.8))
    }

    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    const resizer = new ResizeObserver(resize)
    resizer.observe(wrap)
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    watcher.observe(wrap)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    resize()
    draw()
    start()

    return () => {
      stop()
      resizer.disconnect()
      watcher.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="orb" ref={wrapRef} aria-hidden="true">
      <div className="orb-glow" />
      <canvas className="orb-canvas" ref={canvasRef} />
      {LABELS.map((label, i) => (
        <span
          key={label}
          className="orb-label"
          ref={el => { labelRefs.current[i] = el }}
        >
          {label}
        </span>
      ))}
      <div className="orb-shadow" />
    </div>
  )
}
