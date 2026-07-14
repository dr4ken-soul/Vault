import { BlurInMount } from '../../components/BlurIn'
import { AgentControlPanel } from '../../components/AgentControlPanel'
import { TradeFeed } from '../../components/TradeFeed'
import { KpiSkeleton } from '../../components/Skeleton'
import { KpiTile } from '../../components/KpiTile'
import { PageTransition } from '../../components/PageTransition'
import { triggerAgentCycle } from '../../hooks/useAgentRunner'
import { formatRelativeTime } from '../../lib/format'
import { squadValue } from '../../lib/players'
import { useAgentStore } from '../../stores/agentStore'
import { useSquadStore } from '../../stores/squadStore'
import { useTradeStore } from '../../stores/tradeStore'
import { useWalletStore } from '../../stores/walletStore'

function statusLabel(status: string, loopRunning: boolean): string {
  if (loopRunning) return status
  if (status === 'idle') return 'ready'
  return status
}

export function Dashboard() {
  const playerIds = useSquadStore((s) => s.userPlayerIds)
  const usdtBalance = useWalletStore((s) => s.usdtBalance)
  const trades = useTradeStore((s) => s.trades)
  const openCount = useTradeStore((s) => s.openCount)
  const status = useAgentStore((s) => s.status)
  const lastSyncAt = useAgentStore((s) => s.lastSyncAt)
  const loopRunning = useAgentStore((s) => s.loopRunning)

  const loading = playerIds.length === 0
  const value = squadValue(playerIds)
  const hasActivity = trades.length > 0 || Boolean(lastSyncAt)

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <BlurInMount>
            <p className="mb-2 font-mono text-[11px] text-[var(--text-muted)]">
              Last cycle{' '}
              {lastSyncAt
                ? formatRelativeTime(lastSyncAt)
                : loopRunning
                  ? 'running...'
                  : 'none yet'}
            </p>
            <h1 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Manual control. Nothing runs until you start an agent cycle. Landing page live proof
              is separate.
            </p>
          </BlurInMount>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            ) : (
              <>
                <KpiTile label="Squad value" value={value} countUp suffix="USDt" delay={0.02} />
                <KpiTile
                  label="Agent status"
                  value={statusLabel(status, loopRunning)}
                  mono
                  delay={0.06}
                />
                <KpiTile label="Open trades" value={String(openCount)} delay={0.1} />
                <KpiTile
                  label="USDt balance"
                  value={usdtBalance}
                  countUp
                  suffix="USDt"
                  delay={0.14}
                />
              </>
            )}
          </div>

          <BlurInMount delay={0.16}>
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-xl text-[var(--text-primary)]">Trade feed</h2>
                <span className={`status-pill ${hasActivity ? 'live' : 'idle'}`}>
                  {hasActivity ? 'Manual' : 'Empty'}
                </span>
              </div>

              {!hasActivity && !loopRunning ? (
                <div className="surface mb-3 p-5">
                  <p className="font-display text-lg text-[var(--text-primary)]">No trades yet</p>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)]">
                    First-time sessions start clean so you can test the full loop yourself. Use{' '}
                    <span className="text-[var(--text-primary)]">Run agent cycle</span> in the
                    panel. Watch evaluate, negotiate, settle, then the feed and balance update.
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-4"
                    onClick={() => void triggerAgentCycle()}
                    disabled={loopRunning}
                  >
                    Run first agent cycle
                  </button>
                </div>
              ) : null}

              <TradeFeed trades={trades} loading={false} />
            </div>
          </BlurInMount>
        </div>

        <BlurInMount delay={0.12} className="xl:sticky xl:top-8 xl:self-start">
          <div className="min-h-[28rem]">
            <AgentControlPanel onRunCycle={() => void triggerAgentCycle()} />
          </div>
        </BlurInMount>
      </div>
    </PageTransition>
  )
}
