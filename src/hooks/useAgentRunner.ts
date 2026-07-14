import { useEffect } from 'react'
import { runAgentLoop } from '../services/agent/loop'
import { useAgentStore } from '../stores/agentStore'
import { persistSquads, useSquadStore } from '../stores/squadStore'
import { loadTrades, persistTrades, useTradeStore } from '../stores/tradeStore'
import { useWalletStore } from '../stores/walletStore'

let cycleLock = false

function mapStatus(statusText: string): 'evaluating' | 'negotiating' | 'settling' | 'idle' {
  if (/negotiat/i.test(statusText)) return 'negotiating'
  if (/settl/i.test(statusText)) return 'settling'
  if (/idle|complete|waiting|watching|blocked|declined|ready/i.test(statusText)) return 'idle'
  return 'evaluating'
}

/**
 * Manual agent cycle only. Nothing auto-runs inside the app.
 * Landing page live proof is separate and stays decorative.
 */
export async function triggerAgentCycle(): Promise<void> {
  const wallet = useWalletStore.getState()
  if (!wallet.connected || !wallet.liveWallet || !wallet.counterpart) return
  if (cycleLock || useAgentStore.getState().loopRunning) return

  cycleLock = true
  useAgentStore.getState().setLoopRunning(true)
  useAgentStore.getState().setStatus('evaluating')
  useAgentStore.getState().setProgress({
    status: 'evaluating',
    currentStep: 'Starting evaluation',
    liveReasoning: 'On-device agent cycle started by you.',
  })

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
      currentStep: 'Ready for next cycle',
      liveReasoning:
        result.liveReasoning ||
        'Cycle complete. Press Run agent cycle whenever you want another evaluation.',
    })
    useAgentStore.getState().markSync()
  } catch (err) {
    useAgentStore.getState().setProgress({
      status: 'idle',
      currentStep: 'Ready to retry',
      liveReasoning:
        err instanceof Error
          ? err.message
          : 'Agent cycle failed. You can run another cycle when ready.',
    })
  } finally {
    cycleLock = false
    useAgentStore.getState().setLoopRunning(false)
  }
}

/**
 * Loads any saved trades for this wallet. Does NOT auto-run the agent.
 */
export function useAgentSessionHydration(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const wallet = useWalletStore.getState()
    if (!wallet.address) return

    const existing = loadTrades(wallet.address)
    if (existing.length) {
      useTradeStore.getState().setTrades(existing)
    } else {
      useTradeStore.getState().setTrades([])
    }

    // Fresh connected session messaging if the agent has never run
    const agent = useAgentStore.getState()
    if (!agent.lastSyncAt && agent.logs.length === 0) {
      agent.setProgress({
        status: 'idle',
        currentStep: 'Ready',
        liveReasoning:
          'Agent is idle and waiting. Idle means ready, not blocked. Press Run agent cycle to evaluate the squad and attempt a trade.',
      })
    }
  }, [enabled])
}
