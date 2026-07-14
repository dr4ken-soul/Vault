import { useEffect, useRef, useState } from 'react'
import type { Trade, TradeStatus } from '../lib/types'
import { TradeFeed } from './TradeFeed'

/** Illustrative agent-to-agent settlements for the landing proof section. */
const PROOF_POOL: Array<{
  proposingLabel: string
  receivingLabel: string
  playersOffered: string[]
  playersRequested: string[]
  agreedValue: number
  status: TradeStatus
  note: string
}> = [
  {
    proposingLabel: 'Agent North',
    receivingLabel: 'Agent South',
    playersOffered: ['p-gordon'],
    playersRequested: ['p-isak'],
    agreedValue: 18.4,
    status: 'settled',
    note: 'Form upgrade on the left wing',
  },
  {
    proposingLabel: 'Agent South',
    receivingLabel: 'Agent North',
    playersOffered: ['p-bruno'],
    playersRequested: ['p-palmer'],
    agreedValue: 12.1,
    status: 'accepted',
    note: 'Counter accepted, settlement pending',
  },
  {
    proposingLabel: 'Agent North',
    receivingLabel: 'Agent Meridian',
    playersOffered: ['p-watkins'],
    playersRequested: ['p-salah'],
    agreedValue: 24.6,
    status: 'settled',
    note: 'High output wide forward swap',
  },
  {
    proposingLabel: 'Agent Meridian',
    receivingLabel: 'Agent South',
    playersOffered: ['p-mac-allister'],
    playersRequested: ['p-rice'],
    agreedValue: 9.8,
    status: 'proposed',
    note: 'Midfield balance proposal',
  },
  {
    proposingLabel: 'Agent South',
    receivingLabel: 'Agent North',
    playersOffered: ['p-foden'],
    playersRequested: ['p-odegaard'],
    agreedValue: 15.2,
    status: 'settled',
    note: 'Creator-for-creator settlement',
  },
  {
    proposingLabel: 'Agent North',
    receivingLabel: 'Agent South',
    playersOffered: ['p-trippier'],
    playersRequested: ['p-gabriel'],
    agreedValue: 7.3,
    status: 'countered',
    note: 'Defensive structure counter',
  },
  {
    proposingLabel: 'Agent Meridian',
    receivingLabel: 'Agent North',
    playersOffered: ['p-ederson'],
    playersRequested: ['p-alisson'],
    agreedValue: 6.5,
    status: 'settled',
    note: 'Keeper distribution upgrade',
  },
  {
    proposingLabel: 'Agent South',
    receivingLabel: 'Agent Meridian',
    playersOffered: ['p-haaland'],
    playersRequested: ['p-saka'],
    agreedValue: 31.0,
    status: 'accepted',
    note: 'Front line value rebalance',
  },
]

const MAX_VISIBLE = 3
const TICK_MS = 1000
const NEW_TRADE_MS = 4500

function makeTrade(
  template: (typeof PROOF_POOL)[number],
  seq: number,
  ageMs: number,
): Trade {
  const id = `proof_${seq}_${template.playersOffered[0]}_${template.playersRequested[0]}`
  return {
    id,
    proposingAgent: `0xVault${template.proposingLabel.replace(/\s/g, '')}`,
    receivingAgent: `0xVault${template.receivingLabel.replace(/\s/g, '')}`,
    proposingLabel: template.proposingLabel,
    receivingLabel: template.receivingLabel,
    playersOffered: template.playersOffered,
    playersRequested: template.playersRequested,
    agreedValue: template.agreedValue,
    settlementTxRef:
      template.status === 'settled' ? `0x${(seq * 7919).toString(16).padStart(10, '0')}` : null,
    status: template.status,
    timestamp: Date.now() - ageMs,
    note: template.note,
  }
}

function seedFeed(): Trade[] {
  return [
    makeTrade(PROOF_POOL[0], 1, 42000),
    makeTrade(PROOF_POOL[1], 2, 18000),
  ]
}

/**
 * Landing-page trade proof that keeps moving: new rows slide in on an interval
 * and relative timestamps refresh every second so the block never feels frozen.
 */
export function LiveProofFeed() {
  const [trades, setTrades] = useState<Trade[]>(() => seedFeed())
  // Force relative-time labels ("just now", "5s ago") to advance without remounting rows.
  const [, setClock] = useState(0)
  const seqRef = useRef(2)
  const poolIndexRef = useRef(2)

  useEffect(() => {
    const tick = window.setInterval(() => {
      setClock((n) => n + 1)
    }, TICK_MS)
    return () => window.clearInterval(tick)
  }, [])

  // Inject a new proof trade on a fixed cadence.
  useEffect(() => {
    const push = window.setInterval(() => {
      const template = PROOF_POOL[poolIndexRef.current % PROOF_POOL.length]
      poolIndexRef.current += 1
      seqRef.current += 1

      const next = makeTrade(template, seqRef.current, 0)
      setTrades((prev) => [next, ...prev].slice(0, MAX_VISIBLE))
    }, NEW_TRADE_MS)

    return () => window.clearInterval(push)
  }, [])

  return <TradeFeed trades={trades} />
}
