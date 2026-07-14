import { create } from 'zustand'
import type { Trade } from '../lib/types'

interface TradeStore {
  trades: Trade[]
  openCount: number
  addTrade: (trade: Trade) => void
  setTrades: (trades: Trade[]) => void
  reset: () => void
}

export const useTradeStore = create<TradeStore>((set) => ({
  trades: [],
  openCount: 0,

  addTrade(trade) {
    set((state) => {
      const trades = [trade, ...state.trades]
      const openCount = trades.filter(
        (t) => t.status === 'proposed' || t.status === 'countered' || t.status === 'accepted',
      ).length
      return { trades, openCount }
    })
  },

  setTrades(trades) {
    const openCount = trades.filter(
      (t) => t.status === 'proposed' || t.status === 'countered' || t.status === 'accepted',
    ).length
    set({ trades, openCount })
  },

  reset() {
    set({ trades: [], openCount: 0 })
  },
}))

export function loadTrades(address: string): Trade[] {
  try {
    const raw = localStorage.getItem(`vault.trades.${address.toLowerCase()}`)
    if (!raw) return []
    return JSON.parse(raw) as Trade[]
  } catch {
    return []
  }
}

export function persistTrades(address: string, trades: Trade[]) {
  localStorage.setItem(`vault.trades.${address.toLowerCase()}`, JSON.stringify(trades))
}
