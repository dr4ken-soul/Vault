import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditorialNav } from '../components/EditorialNav'
import { PlayerTile } from '../components/PlayerTile'
import { LiveProofFeed } from '../components/LiveProofFeed'
import { BlurIn } from '../components/BlurIn'
import { getPlayer } from '../lib/players'
import { useWalletStore } from '../stores/walletStore'
import { useSquadStore } from '../stores/squadStore'

export function Landing() {
  const navigate = useNavigate()
  const connect = useWalletStore((s) => s.connect)
  const connecting = useWalletStore((s) => s.connecting)
  const connected = useWalletStore((s) => s.connected)
  const address = useWalletStore((s) => s.address)
  const initForWallet = useSquadStore((s) => s.initForWallet)
  const [connectFocus, setConnectFocus] = useState(false)
  const ctaRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (connected && address) {
      initForWallet(address)
      navigate('/app')
    }
  }, [connected, address, initForWallet, navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connect') === '1') {
      setConnectFocus(true)
      ctaRef.current?.focus()
    }
  }, [])

  const handleConnect = async () => {
    await connect()
  }

  const previewPlayer = getPlayer('p-saka')!

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)]">
      <div className="noise-overlay" aria-hidden />
      <EditorialNav onConnect={handleConnect} connectFocus={connectFocus} />

      {/* Hero */}
      <section className="relative flex min-h-screen items-end overflow-hidden pb-20 pt-24">
        <video
          className="absolute inset-0 h-full w-full scale-105 object-cover"
          src="/vault-hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[rgba(8,10,15,0.4)] to-[rgba(8,10,15,0.15)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />

        <div className="container-narrow relative z-10 w-full px-6">
          <BlurIn once={false}>
            <p className="section-kicker">Tether Developers Cup · QVAC + WDK</p>
            <div className="hero-rule" />
            <h1 className="max-w-3xl font-display text-4xl leading-[1.06] text-[var(--text-primary)] md:text-6xl lg:text-[4.25rem]">
              An agent that runs your squad and trades on your behalf, settled in USDt.
            </h1>
          </BlurIn>
          <BlurIn delay={0.1} once={false}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              QVAC evaluates form on your device. WDK moves USDt when two agents agree. No cloud
              reasoning path. No manual approval step.
            </p>
          </BlurIn>
          <BlurIn delay={0.18} once={false}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                ref={ctaRef}
                type="button"
                className={`btn-primary ${connectFocus ? 'cta-focus-ring' : ''}`}
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? 'Creating WDK wallet...' : 'Connect wallet and enter demo'}
              </button>
              <p className="font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
                SELF-CUSTODIAL · ON DEVICE · MATCHDAY AMBER
              </p>
            </div>
          </BlurIn>
        </div>
      </section>

      {/* Agent loop */}
      <section className="section-pad border-t border-[var(--border-subtle)]">
        <div className="container-narrow">
          <BlurIn>
            <p className="section-kicker">How it works</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">
              The agent loop
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
              Four steps. Continuous. On device until settlement.
            </p>
          </BlurIn>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Build the squad',
                d: 'Roster is data, not cards. Positions, form, value, and traits the agent can actually reason over.',
              },
              {
                n: '02',
                t: 'Watch form and value',
                d: 'The QVAC path evaluates composition continuously on your machine. Nothing leaves the device during reasoning.',
              },
              {
                n: '03',
                t: 'Trade autonomously',
                d: 'When a better deal exists, agents negotiate. On acceptance, WDK settles USDt between wallets.',
              },
            ].map((step, i) => (
              <BlurIn key={step.n} delay={0.08 * i}>
                <div className="surface surface-interactive group h-full p-6 md:p-7">
                  <p className="font-mono text-sm text-[var(--accent)]">{step.n}</p>
                  <h3 className="mt-4 font-display text-xl text-[var(--text-primary)] md:text-2xl">
                    {step.t}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {step.d}
                  </p>
                </div>
              </BlurIn>
            ))}
          </div>
        </div>
      </section>

      {/* Live trade proof */}
      <section className="section-pad relative border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,160,48,0.05),transparent_55%)]" />
        <div className="container-narrow relative">
          <BlurIn>
            <p className="section-kicker">The proof</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">
              Live trade proof
            </h2>
            <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
              Two agents. An offer. An accepted counter. A settled USDt amount.
            </p>
          </BlurIn>
          <BlurIn delay={0.12}>
            <div className="mt-10 max-w-2xl">
              <LiveProofFeed />
              <p className="mt-3 font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
                LIVE PREVIEW · NEW SETTLEMENT EVERY FEW SECONDS
              </p>
            </div>
          </BlurIn>
        </div>
      </section>

      {/* Squad intelligence */}
      <section className="section-pad border-t border-[var(--border-subtle)]">
        <div className="container-narrow grid items-center gap-12 md:grid-cols-2">
          <BlurIn>
            <p className="section-kicker">Squad intelligence</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">
              The same tile the agent reads
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              Radar attributes, value trend, and a short agent read on strengths and style. Landing
              and product share one visual language.
            </p>
          </BlurIn>
          <BlurIn delay={0.1}>
            <div className="max-w-md md:ml-auto">
              <PlayerTile player={previewPlayer} />
            </div>
          </BlurIn>
        </div>
      </section>

      {/* Track fit */}
      <section className="section-pad border-t border-[var(--border-subtle)]">
        <div className="container-narrow">
          <BlurIn>
            <p className="section-kicker">Tracks</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)]">Track fit</h2>
          </BlurIn>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <BlurIn delay={0.06}>
              <div className="surface surface-interactive h-full p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
                  QVAC
                </p>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                  On-device squad evaluation and trade decision logic. No cloud call on the reasoning
                  path.
                </p>
              </div>
            </BlurIn>
            <BlurIn delay={0.12}>
              <div className="surface surface-interactive h-full p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
                  WDK
                </p>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                  Self-custodial agent wallets, signed settlement receipts, and spending limits
                  enforced at the wallet policy layer.
                </p>
              </div>
            </BlurIn>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-pad border-t border-[var(--border-subtle)]">
        <div className="container-narrow text-center">
          <BlurIn>
            <p className="section-kicker mx-auto justify-center">Enter the demo</p>
            <h2 className="font-display text-3xl text-[var(--text-primary)] md:text-5xl">
              Let the agent run the squad.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[var(--text-secondary)]">
              Connect a WDK wallet and watch evaluation, negotiation, and USDt settlement on one
              screen.
            </p>
            <button
              type="button"
              className="btn-primary mt-9"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Creating WDK wallet...' : 'Connect wallet'}
            </button>
          </BlurIn>
        </div>
      </section>
    </div>
  )
}
