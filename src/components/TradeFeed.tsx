import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react'
import type { Trade } from '../lib/types'
import { formatRelativeTime } from '../lib/format'
import { getPlayer } from '../lib/players'
import { CountUp } from './CountUp'
import { TradeRowSkeleton } from './Skeleton'

function tradeLabel(trade: Trade): string {
  const offered = trade.playersOffered.map((id) => getPlayer(id)?.name ?? id).join(', ')
  const requested = trade.playersRequested.map((id) => getPlayer(id)?.name ?? id).join(', ')
  return `${offered} for ${requested}`
}

function StatusIcon({ status }: { status: Trade['status'] }) {
  if (status === 'settled' || status === 'accepted') {
    return <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
  }
  if (status === 'declined') {
    return <XCircle className="h-4 w-4 text-[var(--error)]" />
  }
  return <ArrowLeftRight className="h-4 w-4 text-[var(--accent)]" />
}

export function TradeFeed({
  trades,
  loading = false,
}: {
  trades: Trade[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        <TradeRowSkeleton />
        <TradeRowSkeleton />
        <TradeRowSkeleton />
      </div>
    )
  }

  if (!trades.length) {
    return (
      <div className="surface p-6 text-sm text-[var(--text-secondary)]">
        No trades yet. The agent is evaluating your squad and will propose when a better deal
        appears.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false} mode="popLayout">
        {trades.map((trade) => (
          <motion.div
            key={trade.id}
            layout
            initial={{ opacity: 0, y: -22, filter: 'blur(8px)', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="trade-row surface flex items-center gap-3 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]">
              <StatusIcon status={trade.status} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[var(--text-primary)]">{tradeLabel(trade)}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                {trade.proposingLabel} to {trade.receivingLabel} · {formatRelativeTime(trade.timestamp)} ·{' '}
                {trade.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--accent)]">
                {trade.status === 'settled' ? (
                  <CountUp value={trade.agreedValue} suffix=" USDt" />
                ) : (
                  <span className="font-mono">{trade.agreedValue.toFixed(2)} USDt</span>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
