import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useWalletStore } from '../stores/walletStore'
import { formatUsdt, shortAddress } from '../lib/format'

const links = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/squad', label: 'Squad', end: false },
  { to: '/app/agent', label: 'Agent', end: false },
  { to: '/app/trades', label: 'Trades', end: false },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const address = useWalletStore((s) => s.address)
  const usdtBalance = useWalletStore((s) => s.usdtBalance)
  const disconnect = useWalletStore((s) => s.disconnect)

  return (
    <>
      <div className="border-b border-[var(--border-subtle)] px-5 py-5">
        <div className="font-display text-2xl text-[var(--text-primary)]">Vault</div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Autonomous squad manager</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="nav-active"
                    className="nav-active-bar"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-[1]">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <div className="surface p-3">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Wallet
          </p>
          <p className="font-mono text-xs text-[var(--text-primary)]">
            {address ? shortAddress(address, 5) : 'n/a'}
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--accent)]">
            {formatUsdt(usdtBalance)} USDt
          </p>
          <button type="button" className="btn-ghost mt-3 w-full text-xs" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      </div>
    </>
  )
}

export function AppSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[rgba(8,10,15,0.88)] px-4 backdrop-blur-md md:hidden">
        <div className="font-display text-xl text-[var(--text-primary)]">Vault</div>
        <button
          type="button"
          className="btn-ghost px-2 py-2"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-56 flex-col border-r border-[var(--border-default)] bg-[rgba(8,10,15,0.55)] backdrop-blur-sm md:flex">
        <NavItems />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed bottom-0 left-0 top-14 z-50 flex w-64 flex-col border-r border-[var(--border-default)] bg-[var(--bg-secondary)] md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            >
              <NavItems onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
