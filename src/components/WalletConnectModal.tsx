import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Check, CheckCircle2, Copy, KeyRound, Shield, Wallet, X } from 'lucide-react'
import { useWalletStore } from '../stores/walletStore'
import { shortAddress } from '../lib/format'
import { vaultEase } from '../lib/motion'

type ModalPhase =
  | 'choose'
  | 'restore'
  | 'connecting'
  | 'backup'
  | 'signed-in'
  | 'error'

export function WalletConnectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const connect = useWalletStore((s) => s.connect)
  const restoreFromSeed = useWalletStore((s) => s.restoreFromSeed)
  const clearRevealedSeed = useWalletStore((s) => s.clearRevealedSeed)
  const address = useWalletStore((s) => s.address)
  const spendingLimit = useWalletStore((s) => s.spendingLimit)
  const revealedSeed = useWalletStore((s) => s.revealedSeed)
  const storeError = useWalletStore((s) => s.error)

  const [phase, setPhase] = useState<ModalPhase>('choose')
  const [seedInput, setSeedInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [seedCopied, setSeedCopied] = useState(false)
  const [confirmedBackup, setConfirmedBackup] = useState(false)
  const [seedVisible, setSeedVisible] = useState(false)
  const [connectingLabel, setConnectingLabel] = useState('Creating WDK wallet')

  const words = useMemo(
    () => (revealedSeed ?? '').trim().split(/\s+/).filter(Boolean),
    [revealedSeed],
  )

  const reset = useCallback(() => {
    setPhase('choose')
    setSeedInput('')
    setError(null)
    setSeedCopied(false)
    setConfirmedBackup(false)
    setSeedVisible(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      const t = window.setTimeout(reset, 220)
      return () => window.clearTimeout(t)
    }
  }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'connecting' && phase !== 'backup') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, phase])

  const enterApp = useCallback(() => {
    clearRevealedSeed()
    onClose()
    navigate('/app')
  }, [clearRevealedSeed, navigate, onClose])

  const handleCreate = async () => {
    setPhase('connecting')
    setConnectingLabel('Creating WDK wallet')
    setError(null)
    try {
      await connect()
      setConfirmedBackup(false)
      setSeedVisible(false)
      setSeedCopied(false)
      setPhase('backup')
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : storeError ?? 'Wallet creation failed.')
    }
  }

  const handleRestore = async () => {
    const phrase = seedInput.trim().replace(/\s+/g, ' ')
    if (phrase.split(' ').length < 12) {
      setError('Enter your full 12-word seed phrase, separated by spaces.')
      return
    }
    setPhase('connecting')
    setConnectingLabel('Signing in with seed')
    setError(null)
    try {
      await restoreFromSeed(phrase)
      setPhase('signed-in')
      window.setTimeout(() => {
        onClose()
        navigate('/app')
      }, 1000)
    } catch (err) {
      setPhase('error')
      setError(err instanceof Error ? err.message : storeError ?? 'Could not sign in with that seed.')
    }
  }

  const handleCopySeed = async () => {
    if (!revealedSeed) return
    try {
      await navigator.clipboard.writeText(revealedSeed)
      setSeedCopied(true)
      window.setTimeout(() => setSeedCopied(false), 1800)
    } catch {
      setError('Could not copy. Select the words and copy manually.')
    }
  }

  const canClose = phase !== 'connecting' && phase !== 'backup'

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close wallet modal backdrop"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => {
              if (canClose) onClose()
            }}
            disabled={!canClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 12, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: vaultEase }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
                  WDK
                </p>
                <h2
                  id="wallet-modal-title"
                  className="font-display text-xl text-[var(--text-primary)]"
                >
                  {phase === 'backup'
                    ? 'Save your seed'
                    : phase === 'restore'
                      ? 'Sign in'
                      : 'Agent wallet'}
                </h2>
              </div>
              {canClose ? (
                <button
                  type="button"
                  className="btn-ghost px-2 py-2"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="max-h-[min(78vh,640px)] overflow-y-auto px-5 py-5">
              {phase === 'choose' ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    Vault creates a{' '}
                    <span className="text-[var(--text-primary)]">self-custodial WDK agent wallet</span>{' '}
                    for you. Not MetaMask. After create you will see a 12-word seed once. Save it.
                    That seed is how you sign back in after disconnect.
                  </p>

                  <div className="surface grid gap-3 p-3 sm:grid-cols-3">
                    {[
                      { icon: Wallet, label: 'Self-custodial' },
                      { icon: Shield, label: 'Spend limit' },
                      { icon: KeyRound, label: 'Your seed' },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                      >
                        <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {label}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => void handleCreate()}
                  >
                    Create agent wallet
                  </button>
                  <button
                    type="button"
                    className="btn-ghost w-full"
                    onClick={() => {
                      setPhase('restore')
                      setError(null)
                    }}
                  >
                    Sign in with seed phrase
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
                    Same browser, without disconnect: refresh keeps you signed in. Disconnect clears
                    the session. Then use your seed to return.
                  </p>
                </div>
              ) : null}

              {phase === 'restore' ? (
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Enter the 12-word seed you saved when you created the agent wallet. This is
                    sign-in after disconnect or on a new browser.
                  </p>
                  <textarea
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    rows={3}
                    placeholder="word1 word2 word3 ... word12"
                    className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] outline-none focus:border-[rgba(240,160,48,0.35)]"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-ghost flex-1"
                      onClick={() => setPhase('choose')}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary flex-1"
                      onClick={() => void handleRestore()}
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ) : null}

              {phase === 'connecting' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="skeleton mb-4 h-10 w-10 rounded-full" />
                  <p className="font-display text-lg text-[var(--text-primary)]">
                    {connectingLabel}
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                    Deriving the agent account and registering the spending limit policy through
                    WDK.
                  </p>
                </div>
              ) : null}

              {phase === 'backup' ? (
                <div className="space-y-4">
                  <div className="flex gap-3 rounded-[var(--radius-md)] border border-[rgba(240,160,48,0.28)] bg-[var(--accent-glow)] p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      This is the only time Vault shows your full seed. Write it down or copy it to
                      a password manager. Anyone with these words controls the agent wallet.
                      Disconnect will require this phrase to sign in again.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                      12-word recovery phrase
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1 text-[11px]"
                        onClick={() => setSeedVisible((v) => !v)}
                      >
                        {seedVisible ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1 text-[11px]"
                        onClick={() => void handleCopySeed()}
                      >
                        {seedCopied ? (
                          <span className="inline-flex items-center gap-1 text-[var(--success)]">
                            <Check className="h-3 w-3" /> Copied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Copy className="h-3 w-3" /> Copy
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {words.map((word, i) => (
                      <div
                        key={`${word}-${i}`}
                        className="surface flex items-center gap-2 px-2 py-2 font-mono text-[11px]"
                      >
                        <span className="text-[var(--text-muted)]">{i + 1}.</span>
                        <span className="text-[var(--text-primary)]">
                          {seedVisible ? word : '••••'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {address ? (
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      Address {shortAddress(address, 6)} · limit {spendingLimit} USDt
                    </p>
                  ) : null}

                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] p-3">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--accent)]"
                      checked={confirmedBackup}
                      onChange={(e) => setConfirmedBackup(e.target.checked)}
                    />
                    <span className="text-sm text-[var(--text-secondary)]">
                      I have saved this seed phrase. I understand Vault cannot recover it for me.
                    </span>
                  </label>

                  {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}

                  <button
                    type="button"
                    className="btn-primary w-full"
                    disabled={!confirmedBackup}
                    onClick={enterApp}
                  >
                    Continue to dashboard
                  </button>
                </div>
              ) : null}

              {phase === 'signed-in' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-[var(--success)]" />
                  <p className="font-display text-lg text-[var(--text-primary)]">Signed in</p>
                  <p className="mt-2 font-mono text-sm text-[var(--accent)]">
                    {address ? shortAddress(address, 6) : 'Agent ready'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Entering dashboard...</p>
                </div>
              ) : null}

              {phase === 'error' ? (
                <div className="space-y-4 py-2">
                  <p className="font-display text-lg text-[var(--text-primary)]">
                    Connection failed
                  </p>
                  <p className="text-sm text-[var(--error)]">
                    {error ?? 'Something went wrong with the agent wallet.'}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" className="btn-ghost flex-1" onClick={onClose}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn-primary flex-1"
                      onClick={() => {
                        setPhase('choose')
                        setError(null)
                      }}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
