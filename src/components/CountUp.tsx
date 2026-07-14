import { useEffect, useState } from 'react'
import { formatUsdt } from '../lib/format'

export function CountUp({
  value,
  duration = 900,
  prefix = '',
  suffix = '',
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const from = 0
    const to = value

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return (
    <span className="font-mono">
      {prefix}
      {formatUsdt(display)}
      {suffix}
    </span>
  )
}
