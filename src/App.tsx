import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Landing } from './pages/Landing'
import { AppLayout } from './pages/app/AppLayout'
import { Dashboard } from './pages/app/Dashboard'
import { Squad } from './pages/app/Squad'
import { Agent } from './pages/app/Agent'
import { Trades } from './pages/app/Trades'
import { useWalletStore } from './stores/walletStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function Bootstrap() {
  const restore = useWalletStore((s) => s.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="squad" element={<Squad />} />
        <Route path="agent" element={<Agent />} />
        <Route path="trades" element={<Trades />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Bootstrap />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
