import { useMemo, useState } from 'react'
import { BlurInMount } from '../../components/BlurIn'
import { PageTransition } from '../../components/PageTransition'
import { formatDateTime, formatUsdt, shortAddress } from '../../lib/format'
import { getPlayer } from '../../lib/players'
import { useTradeStore } from '../../stores/tradeStore'

type SortKey = 'timestamp' | 'agreedValue' | 'status'

export function Trades() {
  const trades = useTradeStore((s) => s.trades)
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = useMemo(() => {
    let rows = [...trades]
    if (fromDate) {
      const from = new Date(fromDate).getTime()
      rows = rows.filter((t) => t.timestamp >= from)
    }
    if (toDate) {
      const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1
      rows = rows.filter((t) => t.timestamp <= to)
    }
    rows.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return rows
  }, [trades, sortKey, sortDir, fromDate, toDate])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'timestamp' ? 'desc' : 'asc')
    }
  }

  const names = (ids: string[]) =>
    ids.map((id) => getPlayer(id)?.name ?? id).join(', ')

  return (
    <PageTransition>
      <BlurInMount>
        <h1 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">Trades</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Full settlement history. Sort by column. Filter by date range.
        </p>
      </BlurInMount>

      <BlurInMount delay={0.05}>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-xs text-[var(--text-muted)]">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
            />
          </label>
          <label className="text-xs text-[var(--text-muted)]">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
            />
          </label>
          {(fromDate || toDate) && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setFromDate('')
                setToDate('')
              }}
            >
              Clear dates
            </button>
          )}
        </div>
      </BlurInMount>

      <BlurInMount delay={0.08}>
        <div className="surface mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Counterparties</th>
                <th className="px-4 py-3 font-medium">Players</th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort('agreedValue')}>
                    Value {sortKey === 'agreedValue' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">Settlement ref</th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort('status')}>
                    Status {sortKey === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium">
                  <button type="button" onClick={() => toggleSort('timestamp')}>
                    Time {sortKey === 'timestamp' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-[var(--text-secondary)]">
                    No trades in this range.
                  </td>
                </tr>
              ) : (
                filtered.map((trade) => (
                  <tr
                    key={trade.id}
                    className="trade-row border-b border-[var(--border-subtle)]"
                  >
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-primary)]">
                        {trade.proposingLabel} → {trade.receivingLabel}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                        {shortAddress(trade.proposingAgent)} · {shortAddress(trade.receivingAgent)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {names(trade.playersOffered)} for {names(trade.playersRequested)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--accent)]">
                      {formatUsdt(trade.agreedValue)} USDt
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {trade.settlementTxRef
                        ? `${trade.settlementTxRef.slice(0, 10)}...${trade.settlementTxRef.slice(-6)}`
                        : 'n/a'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-[var(--text-secondary)]">
                      {trade.status}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {formatDateTime(trade.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BlurInMount>
    </PageTransition>
  )
}
