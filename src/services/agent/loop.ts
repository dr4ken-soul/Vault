import { PLAYER_POOL, getPlayer, getPlayers } from '../../lib/players'
import type { AgentLogEntry, Trade } from '../../lib/types'
import { settleWithWdk, validateSpendingLimit, type LiveWallet } from '../wdk'
import {
  evaluateIncomingOffer,
  evaluateSquad,
  findTradeIdea,
} from './evaluate'
import { enrichReasoningWithQvac } from './qvac'

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

export interface LoopContext {
  userWallet: LiveWallet
  counterpartWallet: LiveWallet
  userSquadIds: string[]
  counterpartSquadIds: string[]
  userUsdt: number
  counterpartUsdt: number
  userSpendingLimit: number
}

export interface LoopResult {
  userSquadIds: string[]
  counterpartSquadIds: string[]
  userUsdt: number
  counterpartUsdt: number
  trade: Trade | null
  logs: AgentLogEntry[]
  statusTrail: string[]
  liveReasoning: string
  currentStep: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Full agent decision loop: evaluate → propose → negotiate → settle.
 * All reasoning is on-device. Settlement is signed through WDK.
 */
export async function runAgentLoop(
  ctx: LoopContext,
  onProgress?: (partial: Partial<LoopResult> & { status: string }) => void,
): Promise<LoopResult> {
  const logs: AgentLogEntry[] = []
  const statusTrail: string[] = []
  let liveReasoning = 'Starting on-device evaluation.'
  let currentStep = 'evaluate'

  const push = (status: string, reasoning?: string) => {
    statusTrail.push(status)
    if (reasoning) liveReasoning = reasoning
    onProgress?.({
      status,
      liveReasoning,
      currentStep,
      logs: [...logs],
    })
  }

  push('Evaluating squad composition and form', liveReasoning)
  await sleep(700)

  const evaluation = evaluateSquad(ctx.userSquadIds, PLAYER_POOL)
  const enriched = await enrichReasoningWithQvac(
    evaluation.reasoning,
    evaluation.summary,
  )

  logs.push({
    id: id('log'),
    timestamp: Date.now(),
    step: 'evaluate',
    title: 'Squad evaluation complete',
    detail: `${enriched.text} Engine: ${enriched.engine === 'qvac' ? 'QVAC local model' : 'on-device evaluator'}.`,
  })
  currentStep = 'evaluate'
  push('Evaluation complete', logs[logs.length - 1].detail)
  await sleep(500)

  const idea = findTradeIdea(ctx.userSquadIds, ctx.counterpartSquadIds, evaluation)
  if (!idea) {
    logs.push({
      id: id('log'),
      timestamp: Date.now(),
      step: 'propose',
      title: 'No trade proposed',
      detail:
        'No counterpart holding cleared the form efficiency and spending limit filters in this cycle.',
    })
    currentStep = 'idle'
    push('Ready for next cycle.', logs[logs.length - 1].detail)
    return {
      userSquadIds: ctx.userSquadIds,
      counterpartSquadIds: ctx.counterpartSquadIds,
      userUsdt: ctx.userUsdt,
      counterpartUsdt: ctx.counterpartUsdt,
      trade: null,
      logs,
      statusTrail,
      liveReasoning,
      currentStep: 'Ready for next cycle',
    }
  }

  const offered = getPlayer(idea.offerPlayerId)!
  const requested = getPlayer(idea.requestPlayerId)!
  const cashOut = idea.cashDelta > 0 ? idea.cashDelta : 0
  const cashIn = idea.cashDelta < 0 ? Math.abs(idea.cashDelta) : 0
  const settlementAmount = Math.max(cashOut, cashIn, 0.01)

  currentStep = 'propose'
  const proposeDetail = `Proposed trade with counterpart agent. Offer ${offered.name} for ${requested.name}. ${idea.rationale}`
  logs.push({
    id: id('log'),
    timestamp: Date.now(),
    step: 'propose',
    title: 'Trade proposal constructed',
    detail: proposeDetail,
  })
  push('Proposing trade to counterpart agent', proposeDetail)
  await sleep(800)

  currentStep = 'negotiate'
  push('Counterpart agent evaluating offer', 'Negotiation in progress on device.')
  await sleep(900)

  const decision = evaluateIncomingOffer({
    ourIds: ctx.counterpartSquadIds,
    offeredPlayerId: idea.offerPlayerId,
    requestedPlayerId: idea.requestPlayerId,
    cashDelta: idea.cashDelta,
  })

  logs.push({
    id: id('log'),
    timestamp: Date.now(),
    step: 'negotiate',
    title: decision.accept ? 'Counterpart accepted' : 'Counterpart declined',
    detail: decision.reasoning,
  })
  push(
    decision.accept ? 'Offer accepted. Preparing settlement.' : 'Offer declined.',
    decision.reasoning,
  )

  if (!decision.accept) {
    const trade: Trade = {
      id: id('trade'),
      proposingAgent: ctx.userWallet.address,
      receivingAgent: ctx.counterpartWallet.address,
      proposingLabel: 'Your agent',
      receivingLabel: 'Counterpart agent',
      playersOffered: [idea.offerPlayerId],
      playersRequested: [idea.requestPlayerId],
      agreedValue: settlementAmount,
      settlementTxRef: null,
      status: 'declined',
      timestamp: Date.now(),
      note: decision.reasoning,
    }
    return {
      userSquadIds: ctx.userSquadIds,
      counterpartSquadIds: ctx.counterpartSquadIds,
      userUsdt: ctx.userUsdt,
      counterpartUsdt: ctx.counterpartUsdt,
      trade,
      logs,
      statusTrail,
      liveReasoning,
      currentStep: 'Ready for next cycle',
    }
  }

  currentStep = 'settle'
  push('Settling in USDt through WDK', 'Signing settlement receipt with agent wallet.')
  await sleep(600)

  const tradeId = id('trade')
  const payerIsUser = idea.cashDelta >= 0
  const amount = Math.round(Math.abs(idea.cashDelta) * 100) / 100 || Math.round(
    Math.abs(offered.value - requested.value) * 0.05 * 100,
  ) / 100

  try {
    validateSpendingLimit(
      amount,
      payerIsUser ? ctx.userSpendingLimit : ctx.counterpartWallet.spendingLimit,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Spending limit blocked settlement.'
    logs.push({
      id: id('log'),
      timestamp: Date.now(),
      step: 'settle',
      title: 'Settlement blocked',
      detail: message,
    })
    push('Settlement blocked by spending limit', message)
    return {
      userSquadIds: ctx.userSquadIds,
      counterpartSquadIds: ctx.counterpartSquadIds,
      userUsdt: ctx.userUsdt,
      counterpartUsdt: ctx.counterpartUsdt,
      trade: {
        id: tradeId,
        proposingAgent: ctx.userWallet.address,
        receivingAgent: ctx.counterpartWallet.address,
        proposingLabel: 'Your agent',
        receivingLabel: 'Counterpart agent',
        playersOffered: [idea.offerPlayerId],
        playersRequested: [idea.requestPlayerId],
        agreedValue: amount,
        settlementTxRef: null,
        status: 'accepted',
        timestamp: Date.now(),
        note: message,
      },
      logs,
      statusTrail,
      liveReasoning,
      currentStep: 'Spending limit enforced',
    }
  }

  const fromWallet = payerIsUser ? ctx.userWallet : ctx.counterpartWallet
  const toAddress = payerIsUser ? ctx.counterpartWallet.address : ctx.userWallet.address

  const { txRef } = await settleWithWdk({
    from: fromWallet,
    toAddress,
    amountUsdt: amount,
    tradeId,
    playersOffered: [idea.offerPlayerId],
    playersRequested: [idea.requestPlayerId],
  })

  // Swap players between squads
  const userSquadIds = ctx.userSquadIds
    .filter((pid) => pid !== idea.offerPlayerId)
    .concat(idea.requestPlayerId)
  const counterpartSquadIds = ctx.counterpartSquadIds
    .filter((pid) => pid !== idea.requestPlayerId)
    .concat(idea.offerPlayerId)

  let userUsdt = ctx.userUsdt
  let counterpartUsdt = ctx.counterpartUsdt
  if (payerIsUser) {
    userUsdt = Math.round((userUsdt - amount) * 100) / 100
    counterpartUsdt = Math.round((counterpartUsdt + amount) * 100) / 100
  } else {
    counterpartUsdt = Math.round((counterpartUsdt - amount) * 100) / 100
    userUsdt = Math.round((userUsdt + amount) * 100) / 100
  }

  const settleDetail = `Settled ${amount.toFixed(2)} USDt. WDK signed receipt ${txRef.slice(0, 18)}... Players moved: ${offered.name} to counterpart, ${requested.name} to your squad.`
  logs.push({
    id: id('log'),
    timestamp: Date.now(),
    step: 'settle',
    title: 'Trade settled in USDt',
    detail: settleDetail,
    tradeId,
  })

  const trade: Trade = {
    id: tradeId,
    proposingAgent: ctx.userWallet.address,
    receivingAgent: ctx.counterpartWallet.address,
    proposingLabel: 'Your agent',
    receivingLabel: 'Counterpart agent',
    playersOffered: [idea.offerPlayerId],
    playersRequested: [idea.requestPlayerId],
    agreedValue: amount,
    settlementTxRef: txRef,
    status: 'settled',
    timestamp: Date.now(),
    note: `${offered.name} for ${requested.name}`,
  }

  // Touch value history slightly to show post-trade movement on tiles
  for (const p of getPlayers([idea.offerPlayerId, idea.requestPlayerId])) {
    const next = Math.round(p.value * (1 + (Math.random() - 0.5) * 0.01) * 100) / 100
    p.valueHistory = [...p.valueHistory.slice(1), next]
    p.value = next
  }

  currentStep = 'idle'
  push('Settlement complete. Ready for next cycle.', settleDetail)

  return {
    userSquadIds,
    counterpartSquadIds,
    userUsdt,
    counterpartUsdt,
    trade,
    logs,
    statusTrail,
    liveReasoning: settleDetail,
    currentStep: 'Ready for next cycle',
  }
}
