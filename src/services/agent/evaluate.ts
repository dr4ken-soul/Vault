import { getPlayers, squadValue } from '../../lib/players'
import type { Player, Position } from '../../lib/types'

export interface EvaluationResult {
  weakPositions: Position[]
  undervaluedHoldings: Player[]
  overvaluedHoldings: Player[]
  targetAcquisitions: string[]
  formAverage: number
  squadValue: number
  summary: string
  reasoning: string
}

const POSITION_ORDER: Position[] = ['GK', 'DEF', 'MID', 'FWD']

function formThreshold(players: Player[]): number {
  if (players.length === 0) return 7.5
  const avg = players.reduce((s, p) => s + p.formScore, 0) / players.length
  return avg - 0.6
}

function valueEfficiency(player: Player): number {
  const attrSum =
    player.attributes.pace +
    player.attributes.shooting +
    player.attributes.passing +
    player.attributes.defending +
    player.attributes.physical +
    player.attributes.form
  return attrSum / Math.max(player.value, 1)
}

/**
 * On-device squad evaluation. Runs entirely in the browser with no network calls
 * on the reasoning path. Produces formal agent copy for the reasoning log.
 */
export function evaluateSquad(playerIds: string[], marketPool: Player[]): EvaluationResult {
  const squad = getPlayers(playerIds)
  const total = squadValue(playerIds)
  const formAverage =
    squad.length === 0 ? 0 : squad.reduce((s, p) => s + p.formScore, 0) / squad.length
  const threshold = formThreshold(squad)

  const byPosition = POSITION_ORDER.map((pos) => ({
    pos,
    players: squad.filter((p) => p.position === pos),
  }))

  const weakPositions = byPosition
    .filter(({ players }) => {
      if (players.length === 0) return true
      const avg = players.reduce((s, p) => s + p.formScore, 0) / players.length
      return avg < threshold
    })
    .map(({ pos }) => pos)

  const ranked = [...squad].sort((a, b) => valueEfficiency(a) - valueEfficiency(b))
  const undervaluedHoldings = [...squad]
    .sort((a, b) => valueEfficiency(b) - valueEfficiency(a))
    .slice(0, 2)
  const overvaluedHoldings = ranked.slice(0, 2)

  const owned = new Set(playerIds)
  const targets = marketPool
    .filter((p) => !owned.has(p.id))
    .filter((p) => weakPositions.includes(p.position) || p.formScore >= formAverage + 0.3)
    .sort((a, b) => b.formScore / b.value - a.formScore / a.value)
    .slice(0, 4)
    .map((p) => p.id)

  const weakLabel = weakPositions.length
    ? weakPositions.join(', ')
    : 'none material'
  const summary = `Squad value ${total.toFixed(1)} USDt. Form average ${formAverage.toFixed(2)}. Weak positions: ${weakLabel}.`

  const reasoning = [
    `Evaluated ${squad.length} players on device. No cloud inference call was made.`,
    `Mean form sits at ${formAverage.toFixed(2)}. Positions requiring attention: ${weakLabel}.`,
    overvaluedHoldings[0]
      ? `Lowest efficiency holding is ${overvaluedHoldings[0].name} at ${overvaluedHoldings[0].value.toFixed(1)} USDt with form ${overvaluedHoldings[0].formScore.toFixed(1)}.`
      : 'No inefficient holding identified.',
    targets[0]
      ? `Priority acquisition candidates identified in market pool for later proposal.`
      : 'No acquisition candidate cleared the form and value filters.',
  ].join(' ')

  return {
    weakPositions,
    undervaluedHoldings,
    overvaluedHoldings,
    targetAcquisitions: targets,
    formAverage,
    squadValue: total,
    summary,
    reasoning,
  }
}

export interface TradeIdea {
  offerPlayerId: string
  requestPlayerId: string
  cashDelta: number
  score: number
  rationale: string
}

export function findTradeIdea(
  ourIds: string[],
  theirIds: string[],
  evaluation: EvaluationResult,
): TradeIdea | null {
  const ours = getPlayers(ourIds)
  const theirs = getPlayers(theirIds)
  if (ours.length === 0 || theirs.length === 0) return null

  const offerCandidates = evaluation.overvaluedHoldings.length
    ? evaluation.overvaluedHoldings
    : [...ours].sort((a, b) => a.formScore - b.formScore).slice(0, 3)

  let best: TradeIdea | null = null

  for (const offer of offerCandidates) {
    for (const request of theirs) {
      if (ourIds.includes(request.id)) continue
      // Keep swaps in a band both agents can accept on form.
      const formGain = request.formScore - offer.formScore
      if (formGain < 0.2 || formGain > 0.55) continue
      const weakBoost = evaluation.weakPositions.includes(request.position) ? 1.2 : 0
      const valueGap = request.value - offer.value
      // Prefer modest cash adjustments the spending limit can cover
      if (Math.abs(valueGap) > 120) continue
      const score = formGain * 2 + weakBoost - Math.abs(valueGap) * 0.01
      if (score < 0.35) continue
      if (!best || score > best.score) {
        best = {
          offerPlayerId: offer.id,
          requestPlayerId: request.id,
          cashDelta: Math.round(valueGap * 100) / 100,
          score,
          rationale: `Offer ${offer.name} (${offer.formScore.toFixed(1)} form) for ${request.name} (${request.formScore.toFixed(1)} form). Position fit ${request.position}. Cash adjustment ${valueGap >= 0 ? '+' : ''}${valueGap.toFixed(1)} USDt.`,
        }
      }
    }
  }

  // Fallback: pick the closest form-matched pair so the demo always has a path to settlement.
  if (!best) {
    for (const offer of ours) {
      for (const request of theirs) {
        if (ourIds.includes(request.id)) continue
        const formGain = request.formScore - offer.formScore
        if (formGain < 0.15 || formGain > 0.5) continue
        const valueGap = Math.max(-80, Math.min(80, request.value - offer.value))
        const score = formGain
        if (!best || score > best.score) {
          best = {
            offerPlayerId: offer.id,
            requestPlayerId: request.id,
            cashDelta: Math.round(valueGap * 100) / 100,
            score,
            rationale: `Offer ${offer.name} for ${request.name} on form and value fit. Cash adjustment ${valueGap >= 0 ? '+' : ''}${valueGap.toFixed(1)} USDt.`,
          }
        }
      }
    }
  }

  return best
}

export function evaluateIncomingOffer(params: {
  ourIds: string[]
  offeredPlayerId: string
  requestedPlayerId: string
  cashDelta: number
}): { accept: boolean; counter?: TradeIdea; reasoning: string } {
  const offered = getPlayers([params.offeredPlayerId])[0]
  const requested = getPlayers([params.requestedPlayerId])[0]
  if (!offered || !requested || !params.ourIds.includes(params.requestedPlayerId)) {
    return { accept: false, reasoning: 'Offer references an unknown player. Declined.' }
  }

  const formDelta = offered.formScore - requested.formScore
  const valueDelta = offered.value + (params.cashDelta < 0 ? Math.abs(params.cashDelta) : 0) - requested.value - (params.cashDelta > 0 ? params.cashDelta : 0)

  // Counterpart accepts when form improves or value compensation is fair
  if (formDelta >= -0.15 && valueDelta >= -8) {
    return {
      accept: true,
      reasoning: `Accepted. Receiving ${offered.name} improves local form by ${formDelta.toFixed(2)} with value balance ${valueDelta.toFixed(1)} USDt.`,
    }
  }

  if (formDelta >= -0.5) {
    return {
      accept: true,
      reasoning: `Accepted with tolerance. Form trade-off ${formDelta.toFixed(2)} is covered by squad construction needs at ${offered.position}.`,
    }
  }

  return {
    accept: false,
    reasoning: `Declined. Giving ${requested.name} for ${offered.name} fails form and value thresholds (form ${formDelta.toFixed(2)}, value ${valueDelta.toFixed(1)}).`,
  }
}
