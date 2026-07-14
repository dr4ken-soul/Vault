import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react'
import type { Trade } from '../lib/types'
import { formatRelativeTime } from '../lib/format'
import { getPlayer } from '../lib/players'
import { tradeRowTransition, vaultEase } from '../lib/motion'
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
        Trade history is empty. Run an agent cycle to propose, negotiate, and settle a USDt trade.
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
            initial={{ opacity: 0, y: -36, filter: 'blur(12px)', scale: 0.96 }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, y: 16, filter: 'blur(8px)', scale: 0.98 }}
            transition={tradeRowTransition}
            className="trade-row surface flex items-center gap-3 p-3"
          >
            <motion.div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 480, damping: 22, delay: 0.05 }}
            >
              <StatusIcon status={trade.status} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[var(--text-primary)]">{tradeLabel(trade)}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                {trade.proposingLabel} to {trade.receivingLabel} · {formatRelativeTime(trade.timestamp)} ·{' '}
                {trade.status}
              </p>
            </div>
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: vaultEase, delay: 0.08 }}
            >
              <p className="text-sm text-[var(--accent)]">
                {trade.status === 'settled' ? (
                  <CountUp value={trade.agreedValue} suffix=" USDt" />
                ) : (
                  <span className="font-mono">{trade.agreedValue.toFixed(2)} USDt</span>
                )}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
