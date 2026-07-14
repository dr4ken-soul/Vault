import { create } from 'zustand'
import {
  clearStoredSession,
  createCounterpartWallet,
  createNewWallet,
  createWalletFromSeed,
  loadStoredSession,
  persistSession,
  type LiveWallet,
} from '../services/wdk'
import type { WalletSession } from '../lib/types'

interface WalletStore {
  ready: boolean
  connected: boolean
  connecting: boolean
  address: string | null
  usdtBalance: number
  spendingLimit: number
  liveWallet: LiveWallet | null
  counterpart: LiveWallet | null
  error: string | null
  connect: () => Promise<void>
  restore: () => Promise<void>
  disconnect: () => void
  setUsdtBalance: (value: number) => void
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  ready: false,
  connected: false,
  connecting: false,
  address: null,
  usdtBalance: 0,
  spendingLimit: 500,
  liveWallet: null,
  counterpart: null,
  error: null,

  async restore() {
    const session = loadStoredSession()
    if (!session) {
      set({ ready: true })
      return
    }
    set({ connecting: true, error: null })
    try {
      const user = await createWalletFromSeed(session.seedPhrase, {
        spendingLimit: session.spendingLimit,
        usdtBalance: session.usdtBalance,
      })
      const counterpart = await createCounterpartWallet()
      persistSession({ ...user.session, usdtBalance: session.usdtBalance })
      set({
        ready: true,
        connected: true,
        connecting: false,
        address: user.address,
        usdtBalance: session.usdtBalance,
        spendingLimit: session.spendingLimit,
        liveWallet: user,
        counterpart,
        error: null,
      })
    } catch (err) {
      clearStoredSession()
      set({
        ready: true,
        connecting: false,
        connected: false,
        error: err instanceof Error ? err.message : 'Could not restore wallet session.',
      })
    }
  },

  async connect() {
    if (get().connecting) return
    set({ connecting: true, error: null })
    try {
      const user = await createNewWallet({ spendingLimit: 500, usdtBalance: 2500 })
      const counterpart = await createCounterpartWallet()
      persistSession(user.session)
      set({
        ready: true,
        connected: true,
        connecting: false,
        address: user.address,
        usdtBalance: user.session.usdtBalance,
        spendingLimit: user.session.spendingLimit,
        liveWallet: user,
        counterpart,
        error: null,
      })
    } catch (err) {
      set({
        ready: true,
        connecting: false,
        connected: false,
        error: err instanceof Error ? err.message : 'Wallet creation failed.',
      })
    }
  },

  disconnect() {
    const { liveWallet, counterpart } = get()
    try {
      liveWallet?.wdk.dispose()
      counterpart?.wdk.dispose()
    } catch {
      // ignore dispose races
    }
    clearStoredSession()
    set({
      ready: true,
      connected: false,
      connecting: false,
      address: null,
      usdtBalance: 0,
      liveWallet: null,
      counterpart: null,
      error: null,
    })
  },

  setUsdtBalance(value: number) {
    set({ usdtBalance: value })
    const session = loadStoredSession()
    if (session) {
      const next: WalletSession = { ...session, usdtBalance: value }
      persistSession(next)
    }
  },
}))
