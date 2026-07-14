import { BlurInMount } from '../../components/BlurIn'
import { PageTransition } from '../../components/PageTransition'
import { formatDateTime } from '../../lib/format'
import { useAgentStore } from '../../stores/agentStore'

const stepColour: Record<string, string> = {
  evaluate: 'var(--accent)',
  propose: 'var(--text-secondary)',
  negotiate: 'var(--accent-hover)',
  settle: 'var(--success)',
}

export function Agent() {
  const logs = useAgentStore((s) => s.logs)
  const status = useAgentStore((s) => s.status)
  const liveReasoning = useAgentStore((s) => s.liveReasoning)
  const currentStep = useAgentStore((s) => s.currentStep)

  return (
    <PageTransition>
      <BlurInMount>
        <h1 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">Agent</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Reverse chronological reasoning trace. Every evaluation, proposal, negotiation, and
          settlement decision is recorded here so autonomy stays legible.
        </p>
      </BlurInMount>

      <BlurInMount delay={0.06}>
        <div className="surface mt-6 grid gap-4 p-4 md:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Status</p>
            <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">{status}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Current step
            </p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{currentStep}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Live reasoning
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{liveReasoning}</p>
          </div>
        </div>
      </BlurInMount>

      <div className="mt-8 space-y-3">
        {logs.length === 0 ? (
          <div className="surface p-6 text-sm text-[var(--text-secondary)]">
            No decisions yet. The agent will write its first evaluation on the next cycle.
          </div>
        ) : (
          logs.map((entry, i) => (
            <BlurInMount key={entry.id} delay={Math.min(i * 0.03, 0.3)}>
              <article className="surface surface-interactive p-4">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: stepColour[entry.step] ?? 'var(--text-muted)' }}
                  >
                    {entry.step}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>
                <h2 className="font-display text-lg text-[var(--text-primary)]">{entry.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {entry.detail}
                </p>
              </article>
            </BlurInMount>
          ))
        )}
      </div>
    </PageTransition>
  )
}
