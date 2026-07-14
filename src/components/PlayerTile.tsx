import type { Player } from '../lib/types'
import { formatUsdt } from '../lib/format'
import { RadarChart } from './RadarChart'
import { Sparkline } from './Sparkline'

export function PlayerTile({ player }: { player: Player }) {
  return (
    <article className="player-tile surface flex h-full flex-col p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {/* Vault player photography, provided by Paul */}
          <div
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] font-mono text-xs text-[var(--text-muted)]"
            aria-hidden
          >
            {player.position}
          </div>
          <h3 className="font-display text-lg leading-tight text-[var(--text-primary)]">
            {player.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {player.position} · {player.club}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-[var(--accent)]">
            {formatUsdt(player.value)} USDt
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
            form {player.formScore.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-2">
        <RadarChart attributes={player.attributes} size={168} />
        <div className="mt-2 w-full">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Value trend
          </p>
          <Sparkline values={player.valueHistory} width={220} height={40} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Strengths
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {player.strengths}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Style
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {player.style}
          </p>
        </div>
      </div>
    </article>
  )
}
