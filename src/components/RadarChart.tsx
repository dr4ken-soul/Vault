import { motion, useReducedMotion } from 'motion/react'
import type { PlayerAttributes } from '../lib/types'

const LABELS: { key: keyof PlayerAttributes; label: string }[] = [
  { key: 'pace', label: 'PAC' },
  { key: 'shooting', label: 'SHO' },
  { key: 'passing', label: 'PAS' },
  { key: 'defending', label: 'DEF' },
  { key: 'physical', label: 'PHY' },
  { key: 'form', label: 'FRM' },
]

function polar(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

export function RadarChart({
  attributes,
  size = 160,
}: {
  attributes: PlayerAttributes
  size?: number
}) {
  const reduce = useReducedMotion()
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.36
  const levels = [0.25, 0.5, 0.75, 1]

  const points = LABELS.map((item, i) => {
    const value = Math.max(0, Math.min(100, attributes[item.key])) / 100
    return polar(cx, cy, maxR * value, i, LABELS.length)
  })

  const area = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {levels.map((level) => {
        const ring = LABELS.map((_, i) => {
          const p = polar(cx, cy, maxR * level, i, LABELS.length)
          return `${p.x},${p.y}`
        }).join(' ')
        return <polygon key={level} points={ring} className="radar-grid" />
      })}
      {LABELS.map((_, i) => {
        const p = polar(cx, cy, maxR, i, LABELS.length)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="radar-grid" />
      })}
      <motion.polygon
        points={area}
        className="radar-area"
        initial={reduce ? false : { opacity: 0, scale: 0.72 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {LABELS.map((item, i) => {
        const p = polar(cx, cy, maxR + size * 0.1, i, LABELS.length)
        return (
          <text
            key={item.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-muted)"
            fontSize={size * 0.055}
            fontFamily="var(--font-mono)"
          >
            {item.label}
          </text>
        )
      })}
    </svg>
  )
}
