export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export type AgentStatus = 'idle' | 'evaluating' | 'negotiating' | 'settling'

export type TradeStatus = 'proposed' | 'countered' | 'accepted' | 'settled' | 'declined'

export interface PlayerAttributes {
  pace: number
  shooting: number
  passing: number
  defending: number
  physical: number
  form: number
}

export interface Player {
  id: string
  name: string
  position: Position
  club: string
  value: number
  formScore: number
  attributes: PlayerAttributes
  valueHistory: number[]
  strengths: string
  style: string
}

export interface Squad {
  id: string
  ownerAddress: string
  playerIds: string[]
  totalValue: number
}

export interface AgentState {
  walletAddress: string
  squadId: string
  status: AgentStatus
  spendingLimit: number
  lastDecisionAt: number | null
  currentStep: string
  liveReasoning: string
}

export interface Trade {
  id: string
  proposingAgent: string
  receivingAgent: string
  proposingLabel: string
  receivingLabel: string
  playersOffered: string[]
  playersRequested: string[]
  agreedValue: number
  settlementTxRef: string | null
  status: TradeStatus
  timestamp: number
  note: string
}

export interface AgentLogEntry {
  id: string
  timestamp: number
  step: 'evaluate' | 'propose' | 'negotiate' | 'settle'
  title: string
  detail: string
  tradeId?: string
}

export interface WalletSession {
  address: string
  seedPhrase: string
  usdtBalance: number
  spendingLimit: number
  createdAt: number
}
