import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronUp, Copy, LogOut } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { useAgentStore } from '../stores/agentStore'
import { formatUsdt, shortAddress } from '../lib/format'
import { vaultEase } from '../lib/motion'

/**
 * App-interior wallet control. Opens upward from the sidebar footer (bottom left).
 */
export function WalletDropdown() {
  const navigate = useNavigate()
  const address = useWalletStore((s) => s.address)
  const usdtBalance = useWalletStore((s) => s.usdtBalance)
  const spendingLimit = useWalletStore((s) => s.spendingLimit)
  const disconnect = useWalletStore((s) => s.disconnect)
  const agentStatus = useAgentStore((s) => s.status)

  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!address) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore clipboard failures
    }
  }

  const handleDisconnect = () => {
    setOpen(false)
    navigate('/', { replace: true, state: { disconnected: true } })
    disconnect()
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[rgba(18,20,29,0.7)] px-3 py-2.5 text-left transition-colors hover:border-[rgba(240,160,48,0.28)] hover:bg-[var(--accent-glow)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--success)] shadow-[0_0_8px_rgba(34,197,94,0.65)]" />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-xs text-[var(--text-primary)]">
            {shortAddress(address, 4)}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] text-[var(--accent)]">
            {formatUsdt(usdtBalance)} USDt
          </span>
        </span>
        <ChevronUp
          className={`h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-full min-w-[15.5rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: vaultEase }}
            style={{ transformOrigin: 'bottom left' }}
          >
            <div className="border-b border-[var(--border-subtle)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
                </span>
                <p className="text-sm text-[var(--text-primary)]">Agent online</p>
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                Status {agentStatus} · limit {spendingLimit} USDt
              </p>
            </div>

            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Address
                  </p>
                  <p className="truncate font-mono text-xs text-[var(--text-primary)]">
                    {shortAddress(address, 8)}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-2 py-2"
                  onClick={() => void handleCopy()}
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="surface p-2">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Network
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--text-primary)]">Sepolia</p>
                </div>
                <div className="surface p-2">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    USDt
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--accent)]">
                    {formatUsdt(usdtBalance)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                Disconnect clears this session. Sign in again with the seed you saved at create.
              </p>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[rgba(239,68,68,0.14)]"
                onClick={handleDisconnect}
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
