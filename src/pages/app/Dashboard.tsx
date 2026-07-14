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

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <BlurInMount>
            <p className="mb-2 font-mono text-[11px] text-[var(--text-muted)]">
              Last updated{' '}
              {lastSyncAt ? formatRelativeTime(lastSyncAt) : loopRunning ? 'syncing...' : 'pending'}
            </p>
            <h1 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Live view of squad value, agent activity, and WDK settlement feed.
            </p>
          </BlurInMount>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
            ) : (
              <>
                <KpiTile label="Squad value" value={value} countUp suffix="USDt" delay={0.02} />
                <KpiTile label="Agent status" value={status} mono delay={0.06} />
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
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-[var(--text-primary)]">Trade feed</h2>
                <span className="status-pill live">Live</span>
              </div>
              <TradeFeed trades={trades} loading={loading && trades.length === 0} />
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
