export function Sparkline({
  values,
  width = 120,
  height = 36,
}: {
  values: number[]
  width?: number
  height?: number
}) {
  if (!values.length) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 0.01)
  const pad = 2

  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2)
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return { x, y }
  })

  const line = coords.map((c) => `${c.x},${c.y}`).join(' ')
  const fill = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polygon points={fill} className="spark-fill" />
      <polyline points={line} className="spark-line" />
    </svg>
  )
}
