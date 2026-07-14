import { useWalletStore } from '../stores/walletStore'
import { useSquadStore } from '../stores/squadStore'
import { useAgentStore } from '../stores/agentStore'
import { formatUsdt, shortAddress } from '../lib/format'
import { squadValue } from '../lib/players'

export function EditorialNav({
  onConnect,
  connectFocus = false,
}: {
  onConnect: () => void
  connectFocus?: boolean
}) {
  const connected = useWalletStore((s) => s.connected)
  const connecting = useWalletStore((s) => s.connecting)
  const address = useWalletStore((s) => s.address)
  const usdtBalance = useWalletStore((s) => s.usdtBalance)
  const playerIds = useSquadStore((s) => s.userPlayerIds)
  const agentStatus = useAgentStore((s) => s.status)

  const value = playerIds.length ? squadValue(playerIds) : 0
  const tickerItems = [
    `SQUAD VALUE ${formatUsdt(value)} USDt`,
    `AGENT ${agentStatus.toUpperCase()}`,
    connected && address ? `WALLET ${shortAddress(address)}` : 'WALLET DISCONNECTED',
    `USDT ${formatUsdt(usdtBalance)}`,
    'SETTLEMENT WDK',
    'REASONING ON DEVICE QVAC PATH',
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(8,10,15,0.72)] backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-[90rem] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-6">
        <div className="font-display text-xl tracking-tight text-[var(--text-primary)]">Vault</div>

        <div className="relative hidden overflow-hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[rgba(8,10,15,0.9)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[rgba(8,10,15,0.9)] to-transparent" />
          <div className="ticker-track gap-8 font-mono text-[11px] tracking-wider text-[var(--text-secondary)]">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={`${item}-${i}`} className="shrink-0">
                <span className="mr-8 text-[var(--accent)]">●</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          {connected && address ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)]">
              {shortAddress(address)}
            </div>
          ) : (
            <button
              type="button"
              className={`btn-primary px-4 py-2 text-sm ${connectFocus ? 'cta-focus-ring' : ''}`}
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? 'Creating wallet...' : 'Connect wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
