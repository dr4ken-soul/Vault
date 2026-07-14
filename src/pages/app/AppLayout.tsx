import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { AppSidebar } from '../../components/AppSidebar'
import { useAgentSessionHydration } from '../../hooks/useAgentRunner'
import { useAgentStore } from '../../stores/agentStore'
import { useSquadStore } from '../../stores/squadStore'
import { useTradeStore } from '../../stores/tradeStore'
import { useWalletStore } from '../../stores/walletStore'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const ready = useWalletStore((s) => s.ready)
  const reconnecting = useWalletStore((s) => s.reconnecting)
  const connected = useWalletStore((s) => s.connected)
  const address = useWalletStore((s) => s.address)
  const initForWallet = useSquadStore((s) => s.initForWallet)
  const resetAgent = useAgentStore((s) => s.reset)
  const resetTrades = useTradeStore((s) => s.reset)

  useAgentSessionHydration(ready && connected && !reconnecting)

  useEffect(() => {
    if (connected && address) {
      initForWallet(address)
    }
  }, [connected, address, initForWallet])

  useEffect(() => {
    if (ready && !reconnecting && !connected) {
      resetAgent()
      resetTrades()
      navigate('/', { replace: true, state: { disconnected: true } })
    }
  }, [ready, reconnecting, connected, navigate, resetAgent, resetTrades])

  if (!ready || reconnecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="skeleton mx-auto mb-3 h-2 w-32" />
          <p className="font-mono text-sm text-[var(--text-muted)]">Restoring WDK session...</p>
        </div>
      </div>
    )
  }

  if (!connected) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="relative min-h-screen">
      <div className="app-starfield" />
      <div className="noise-overlay" aria-hidden />
      <AppSidebar />

      <main className="relative z-10 min-h-screen pt-14 md:pl-56 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
