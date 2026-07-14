import { BlurInMount } from './BlurIn'
import { CountUp } from './CountUp'

export function KpiTile({
  label,
  value,
  delay = 0,
  mono = true,
  countUp = false,
  suffix = '',
}: {
  label: string
  value: string | number
  delay?: number
  mono?: boolean
  countUp?: boolean
  suffix?: string
}) {
  return (
    <BlurInMount delay={delay}>
      <div className="surface surface-interactive p-4">
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p
          className={`mt-2 text-lg text-[var(--text-primary)] ${mono ? 'font-mono' : 'font-display'}`}
        >
          {countUp && typeof value === 'number' ? (
            <>
              <CountUp value={value} />
              {suffix ? ` ${suffix}` : ''}
            </>
          ) : (
            value
          )}
        </p>
      </div>
    </BlurInMount>
  )
}
