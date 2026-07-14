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

function balanceKey(address: string) {
  return `vault.balance.${address.toLowerCase()}`
}

function loadBalanceForAddress(address: string, fallback: number) {
  try {
    const raw = localStorage.getItem(balanceKey(address))
    if (raw == null) return fallback
    const n = Number(raw)
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

function persistBalanceForAddress(address: string, value: number) {
  localStorage.setItem(balanceKey(address), String(value))
}

interface WalletStore {
  ready: boolean
  connected: boolean
  connecting: boolean
  reconnecting: boolean
  address: string | null
  usdtBalance: number
  spendingLimit: number
  /** Seed shown once after create so the user can back it up. */
  revealedSeed: string | null
  liveWallet: LiveWallet | null
  counterpart: LiveWallet | null
  error: string | null
  /** Returns the new seed phrase so the UI can force a backup step. */
  connect: () => Promise<string>
  restoreFromSeed: (seedPhrase: string) => Promise<void>
  restore: () => Promise<void>
  clearRevealedSeed: () => void
  disconnect: () => void
  setUsdtBalance: (value: number) => void
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  ready: false,
  connected: false,
  connecting: false,
  reconnecting: true,
  address: null,
  usdtBalance: 0,
  spendingLimit: 500,
  revealedSeed: null,
  liveWallet: null,
  counterpart: null,
  error: null,

  clearRevealedSeed() {
    set({ revealedSeed: null })
  },

  async restore() {
    const session = loadStoredSession()
    if (!session) {
      set({ ready: true, reconnecting: false })
      return
    }
    set({ connecting: true, reconnecting: true, error: null })
    try {
      const user = await createWalletFromSeed(session.seedPhrase, {
        spendingLimit: session.spendingLimit,
        usdtBalance: session.usdtBalance,
      })
      const counterpart = await createCounterpartWallet()
      const usdtBalance = loadBalanceForAddress(user.address, session.usdtBalance)
      persistSession({ ...user.session, usdtBalance })
      persistBalanceForAddress(user.address, usdtBalance)
      set({
        ready: true,
        connected: true,
        connecting: false,
        reconnecting: false,
        address: user.address,
        usdtBalance,
        spendingLimit: session.spendingLimit,
        revealedSeed: null,
        liveWallet: user,
        counterpart,
        error: null,
      })
    } catch (err) {
      clearStoredSession()
      set({
        ready: true,
        reconnecting: false,
        connecting: false,
        connected: false,
        error: err instanceof Error ? err.message : 'Could not restore wallet session.',
      })
    }
  },

  async connect() {
    if (get().connecting) throw new Error('Wallet creation already in progress.')
    set({ connecting: true, error: null })
    try {
      const user = await createNewWallet({ spendingLimit: 500, usdtBalance: 2500 })
      const counterpart = await createCounterpartWallet()
      persistSession(user.session)
      persistBalanceForAddress(user.address, user.session.usdtBalance)
      set({
        ready: true,
        connected: true,
        connecting: false,
        reconnecting: false,
        address: user.address,
        usdtBalance: user.session.usdtBalance,
        spendingLimit: user.session.spendingLimit,
        revealedSeed: user.seedPhrase,
        liveWallet: user,
        counterpart,
        error: null,
      })
      return user.seedPhrase
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wallet creation failed.'
      set({
        ready: true,
        connecting: false,
        connected: false,
        revealedSeed: null,
        error: message,
      })
      throw new Error(message)
    }
  },

  async restoreFromSeed(seedPhrase: string) {
    if (get().connecting) return
    set({ connecting: true, error: null })
    try {
      const user = await createWalletFromSeed(seedPhrase, {
        spendingLimit: 500,
        usdtBalance: 2500,
      })
      const counterpart = await createCounterpartWallet()
      const usdtBalance = loadBalanceForAddress(user.address, 2500)
      persistSession({ ...user.session, usdtBalance })
      persistBalanceForAddress(user.address, usdtBalance)
      set({
        ready: true,
        connected: true,
        connecting: false,
        reconnecting: false,
        address: user.address,
        usdtBalance,
        spendingLimit: user.session.spendingLimit,
        revealedSeed: null,
        liveWallet: user,
        counterpart,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not restore wallet.'
      set({
        ready: true,
        connecting: false,
        connected: false,
        error: message,
      })
      throw new Error(message)
    }
  },

  disconnect() {
    const { liveWallet, counterpart, address, usdtBalance } = get()
    if (address) persistBalanceForAddress(address, usdtBalance)
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
      reconnecting: false,
      address: null,
      usdtBalance: 0,
      revealedSeed: null,
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
    const address = get().address
    if (address) persistBalanceForAddress(address, value)
  },
}))
