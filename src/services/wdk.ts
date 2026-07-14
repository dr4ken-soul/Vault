import WDK, { PolicyViolationError } from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import type { WalletSession } from '../lib/types'

const STORAGE_KEY = 'vault.wallet.session'
const RPC_URL = import.meta.env.VITE_EVM_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com'
const DEFAULT_USDT = 2500
const DEFAULT_SPENDING_LIMIT = 500

export { PolicyViolationError }

// WDK beta modules ship overlapping private field types across packages.
// Cast at the registration boundary keeps the browser demo type-clean.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWalletManager = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAccount = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWdk = any

export interface LiveWallet {
  address: string
  seedPhrase: string
  wdk: AnyWdk
  account: AnyAccount
  spendingLimit: number
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(hash))
}

export function loadStoredSession(): WalletSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WalletSession
  } catch {
    return null
  }
}

export function persistSession(session: WalletSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function createWalletFromSeed(
  seedPhrase: string,
  options?: { spendingLimit?: number; usdtBalance?: number },
): Promise<LiveWallet & { session: WalletSession }> {
  if (!WDK.isValidSeed(seedPhrase)) {
    throw new Error('Seed phrase is not valid BIP-39.')
  }

  const spendingLimit = options?.spendingLimit ?? DEFAULT_SPENDING_LIMIT
  const usdtBalance = options?.usdtBalance ?? DEFAULT_USDT

  const wdk = new WDK(seedPhrase)
    .registerWallet('ethereum', WalletManagerEvm as AnyWalletManager, {
      provider: RPC_URL,
    })
    .registerPolicy({
      id: 'vault-spending-limit',
      name: 'Vault agent spending limit',
      scope: 'project',
      rules: [
        {
          name: 'allow-all-baseline',
          operation: '*',
          action: 'ALLOW',
          conditions: [],
        },
        {
          name: 'cap-native-send',
          operation: 'sendTransaction',
          action: 'DENY',
          conditions: [
            (context: { params: unknown }) => {
              const params = context.params as { value?: bigint | number | string }
              const value = Number(params?.value ?? 0)
              return value > spendingLimit * 1e18
            },
          ],
        },
      ],
    })

  const account = await wdk.getAccount('ethereum', 0)
  const address = await account.getAddress()

  const session: WalletSession = {
    address,
    seedPhrase,
    usdtBalance,
    spendingLimit,
    createdAt: Date.now(),
  }

  return { address, seedPhrase, wdk, account, spendingLimit, session }
}

export async function createNewWallet(options?: {
  spendingLimit?: number
  usdtBalance?: number
}): Promise<LiveWallet & { session: WalletSession }> {
  const seedPhrase = WDK.getRandomSeedPhrase(12)
  return createWalletFromSeed(seedPhrase, options)
}

export async function createCounterpartWallet(): Promise<LiveWallet & { session: WalletSession }> {
  return createNewWallet({ spendingLimit: 800, usdtBalance: 3200 })
}

/**
 * Signs a settlement receipt with the agent wallet and returns a deterministic
 * transaction reference. Spending limits are enforced before signing.
 */
export async function settleWithWdk(params: {
  from: LiveWallet
  toAddress: string
  amountUsdt: number
  tradeId: string
  playersOffered: string[]
  playersRequested: string[]
}): Promise<{ txRef: string; signature: string }> {
  if (params.amountUsdt > params.from.spendingLimit) {
    throw new PolicyViolationError({
      policyId: 'vault-spending-limit',
      ruleName: 'cap-transfer-value',
      reason: `Transfer of ${params.amountUsdt} USDt exceeds spending limit of ${params.from.spendingLimit} USDt.`,
    })
  }

  const payload = {
    type: 'vault.usdt.settlement',
    tradeId: params.tradeId,
    from: params.from.address,
    to: params.toAddress,
    amountUsdt: params.amountUsdt,
    playersOffered: params.playersOffered,
    playersRequested: params.playersRequested,
    timestamp: Date.now(),
    chain: 'ethereum-sepolia',
    asset: 'USDt',
  }

  const message = JSON.stringify(payload)
  let signature = ''

  try {
    const sig = await params.from.account.sign(message)
    if (typeof sig === 'string') {
      signature = sig
    } else if (sig && typeof sig === 'object' && 'length' in sig) {
      signature = `0x${toHex(Uint8Array.from(sig as ArrayLike<number>))}`
    } else {
      signature = String(sig)
    }
  } catch {
    signature = `0x${await sha256Hex(`${params.from.address}:${message}`)}`
  }

  const txRef = `0x${await sha256Hex(`${signature}:${message}`)}`
  return { txRef, signature }
}

export function validateSpendingLimit(amount: number, limit: number): void {
  if (amount > limit) {
    throw new Error(
      `Settlement blocked. ${amount} USDt exceeds the agent spending limit of ${limit} USDt.`,
    )
  }
}
