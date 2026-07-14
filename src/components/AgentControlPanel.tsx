import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { motion } from 'motion/react'
import { useAgentStore } from '../stores/agentStore'
import { formatRelativeTime } from '../lib/format'

function statusLabel(status: string, loopRunning: boolean): string {
  if (loopRunning) return status
  if (status === 'idle') return 'ready'
  return status
}

export function AgentControlPanel({ onRunCycle }: { onRunCycle?: () => void }) {
  const status = useAgentStore((s) => s.status)
  const currentStep = useAgentStore((s) => s.currentStep)
  const liveReasoning = useAgentStore((s) => s.liveReasoning)
  const lastSyncAt = useAgentStore((s) => s.lastSyncAt)
  const loopRunning = useAgentStore((s) => s.loopRunning)

  const busy = loopRunning || status === 'evaluating' || status === 'negotiating' || status === 'settling'
  const displayStatus = statusLabel(status, loopRunning)
  const pillClass = busy ? 'status-pill busy' : 'status-pill live'

  return (
    <aside className="surface-filled flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <motion.span
            animate={busy ? { scale: [1, 1.12, 1], opacity: [1, 0.7, 1] } : { scale: 1, opacity: 1 }}
            transition={busy ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : {}}
          >
            <Activity className="h-4 w-4 text-[var(--accent)]" />
          </motion.span>
          <h2 className="font-display text-lg text-[var(--text-primary)]">Agent</h2>
        </div>
        <span className={pillClass}>{displayStatus}</span>
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Current step
          </p>
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[var(--text-primary)]"
          >
            {currentStep}
          </motion.p>
        </div>

        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Live reasoning
          </p>
          <motion.p
            key={liveReasoning}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            {liveReasoning}
          </motion.p>
        </div>

        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Last decision
          </p>
          <p className="font-mono text-xs text-[var(--text-muted)]">
            {lastSyncAt ? formatRelativeTime(lastSyncAt) : 'No cycle run yet'}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3 border-t border-[var(--border-subtle)] pt-3">
        {onRunCycle ? (
          <>
            <button
              type="button"
              className="btn-primary w-full py-2 text-sm"
              onClick={onRunCycle}
              disabled={loopRunning}
            >
              {loopRunning ? 'Cycle running...' : 'Run agent cycle'}
            </button>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              {loopRunning
                ? 'Wait for this cycle to finish, then you can run another.'
                : 'Ready means the agent is free. Click above to evaluate, negotiate, and settle.'}
            </p>
          </>
        ) : null}
        <Link
          to="/app/agent"
          className="block text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
        >
          Open full reasoning log
        </Link>
      </div>
    </aside>
  )
}
