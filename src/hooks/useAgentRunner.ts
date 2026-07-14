import { useCallback, useEffect, useRef } from 'react'
import { runAgentLoop } from '../services/agent/loop'
import { useAgentStore } from '../stores/agentStore'
import { persistSquads, useSquadStore } from '../stores/squadStore'
import { loadTrades, persistTrades, useTradeStore } from '../stores/tradeStore'
import { useWalletStore } from '../stores/walletStore'

let cycleLock = false

function mapStatus(statusText: string): 'evaluating' | 'negotiating' | 'settling' | 'idle' {
  if (/negotiat/i.test(statusText)) return 'negotiating'
  if (/settl/i.test(statusText)) return 'settling'
  if (/idle|complete|waiting|watching|blocked|declined/i.test(statusText)) return 'idle'
  return 'evaluating'
}

/** Shared agent cycle used by the interval runner and the dashboard button. */
export async function triggerAgentCycle(): Promise<void> {
  const wallet = useWalletStore.getState()
  if (!wallet.connected || !wallet.liveWallet || !wallet.counterpart) return
  if (cycleLock || useAgentStore.getState().loopRunning) return

  cycleLock = true
  useAgentStore.getState().setLoopRunning(true)
  useAgentStore.getState().setStatus('evaluating')

  try {
    const squad = useSquadStore.getState()
    const result = await runAgentLoop(
      {
        userWallet: wallet.liveWallet,
        counterpartWallet: wallet.counterpart,
        userSquadIds: squad.userPlayerIds,
        counterpartSquadIds: squad.counterpartPlayerIds,
        userUsdt: wallet.usdtBalance,
        counterpartUsdt: 3200,
        userSpendingLimit: wallet.spendingLimit,
      },
      (partial) => {
        const statusText = partial.status ?? ''
        useAgentStore.getState().setProgress({
          status: mapStatus(statusText),
          currentStep: partial.currentStep ?? statusText,
          liveReasoning: partial.liveReasoning,
        })
      },
    )

    useSquadStore.getState().setSquads(result.userSquadIds, result.counterpartSquadIds)
    if (wallet.address) {
      persistSquads(wallet.address, result.userSquadIds, result.counterpartSquadIds)
    }
    wallet.setUsdtBalance(result.userUsdt)

    if (result.trade) {
      useTradeStore.getState().addTrade(result.trade)
      if (wallet.address) {
        persistTrades(wallet.address, useTradeStore.getState().trades)
      }
    }

    useAgentStore.getState().prependLogs(result.logs)
    useAgentStore.getState().setProgress({
      status: 'idle',
      currentStep: result.currentStep,
      liveReasoning: result.liveReasoning,
    })
    useAgentStore.getState().markSync()
  } catch (err) {
    useAgentStore.getState().setProgress({
      status: 'idle',
      currentStep: 'Agent cycle error',
      liveReasoning:
        err instanceof Error ? err.message : 'Agent cycle failed. Will retry on the next loop.',
    })
  } finally {
    cycleLock = false
    useAgentStore.getState().setLoopRunning(false)
  }
}

/**
 * Starts the autonomous agent loop once a wallet is connected.
 * Cycles periodically so the dashboard always has live activity for demos.
 */
export function useAgentRunner(enabled: boolean) {
  const timerRef = useRef<number | null>(null)

  const runOnce = useCallback(async () => {
    await triggerAgentCycle()
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) window.clearInterval(timerRef.current)
      return
    }

    const wallet = useWalletStore.getState()
    if (wallet.address) {
      const existing = loadTrades(wallet.address)
      if (existing.length) useTradeStore.getState().setTrades(existing)
    }

    const boot = window.setTimeout(() => {
      void runOnce()
    }, 1200)

    timerRef.current = window.setInterval(() => {
      void runOnce()
    }, 45000)

    return () => {
      window.clearTimeout(boot)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [enabled, runOnce])

  return { runOnce }
}
