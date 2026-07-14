import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import type { PlayerAttributes } from '../lib/types'
import { vaultEase } from '../lib/motion'

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
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
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
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
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
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={false}
        animate={
          reduce
            ? { opacity: 1, scale: 1 }
            : inView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.55 }
        }
        transition={{ duration: 0.75, ease: vaultEase }}
      />
      {LABELS.map((item, i) => {
        const p = polar(cx, cy, maxR + size * 0.1, i, LABELS.length)
        return (
          <motion.text
            key={item.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-muted)"
            fontSize={size * 0.055}
            fontFamily="var(--font-mono)"
            initial={false}
            animate={
              reduce
                ? { opacity: 1 }
                : inView
                  ? { opacity: 1 }
                  : { opacity: 0 }
            }
            transition={{ duration: 0.45, delay: inView ? 0.08 * i : 0, ease: vaultEase }}
          >
            {item.label}
          </motion.text>
        )
      })}
    </svg>
  )
}
