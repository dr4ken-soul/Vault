import { create } from 'zustand'
import {
  buildCounterpartSquadIds,
  buildUserSquadIds,
  squadValue,
} from '../lib/players'

interface SquadStore {
  userPlayerIds: string[]
  counterpartPlayerIds: string[]
  hydrated: boolean
  initForWallet: (address: string) => void
  setSquads: (user: string[], counterpart: string[]) => void
  userSquadValue: () => number
}

export const useSquadStore = create<SquadStore>((set, get) => ({
  userPlayerIds: [],
  counterpartPlayerIds: [],
  hydrated: false,

  initForWallet(address: string) {
    const key = `vault.squad.${address.toLowerCase()}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          userPlayerIds: string[]
          counterpartPlayerIds: string[]
        }
        set({
          userPlayerIds: parsed.userPlayerIds,
          counterpartPlayerIds: parsed.counterpartPlayerIds,
          hydrated: true,
        })
        return
      }
    } catch {
      // fall through to seed
    }
    const userPlayerIds = buildUserSquadIds()
    const counterpartPlayerIds = buildCounterpartSquadIds()
    localStorage.setItem(
      key,
      JSON.stringify({ userPlayerIds, counterpartPlayerIds }),
    )
    set({ userPlayerIds, counterpartPlayerIds, hydrated: true })
  },

  setSquads(user, counterpart) {
    set({ userPlayerIds: user, counterpartPlayerIds: counterpart })
    // Persist against current first player path is handled by wallet address key in app shell
  },

  userSquadValue() {
    return squadValue(get().userPlayerIds)
  },
}))

export function persistSquads(address: string, user: string[], counterpart: string[]) {
  const key = `vault.squad.${address.toLowerCase()}`
  localStorage.setItem(
    key,
    JSON.stringify({ userPlayerIds: user, counterpartPlayerIds: counterpart }),
  )
}
