import { create } from 'zustand'
import type { AgentLogEntry, AgentStatus } from '../lib/types'

interface AgentStore {
  status: AgentStatus
  currentStep: string
  liveReasoning: string
  lastSyncAt: number | null
  logs: AgentLogEntry[]
  loopRunning: boolean
  setStatus: (status: AgentStatus) => void
  setProgress: (payload: {
    status?: AgentStatus
    currentStep?: string
    liveReasoning?: string
  }) => void
  prependLogs: (entries: AgentLogEntry[]) => void
  markSync: () => void
  setLoopRunning: (running: boolean) => void
  reset: () => void
}

export const useAgentStore = create<AgentStore>((set) => ({
  status: 'idle',
  currentStep: 'Ready',
  liveReasoning:
    'Agent is idle and waiting. Idle means ready, not blocked. Press Run agent cycle to evaluate the squad and attempt a trade.',
  lastSyncAt: null,
  logs: [],
  loopRunning: false,

  setStatus(status) {
    set({ status })
  },

  setProgress(payload) {
    set((state) => ({
      status: payload.status ?? state.status,
      currentStep: payload.currentStep ?? state.currentStep,
      liveReasoning: payload.liveReasoning ?? state.liveReasoning,
    }))
  },

  prependLogs(entries) {
    if (!entries.length) return
    set((state) => ({
      logs: [...entries].reverse().concat(state.logs).slice(0, 200),
    }))
  },

  markSync() {
    set({ lastSyncAt: Date.now() })
  },

  setLoopRunning(running) {
    set({ loopRunning: running })
  },

  reset() {
    set({
      status: 'idle',
      currentStep: 'Ready',
      liveReasoning:
        'Agent is idle and waiting. Idle means ready, not blocked. Press Run agent cycle to evaluate the squad and attempt a trade.',
      lastSyncAt: null,
      logs: [],
      loopRunning: false,
    })
  },
}))
