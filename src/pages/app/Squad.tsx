import { BlurInMount } from '../../components/BlurIn'
import { PageTransition } from '../../components/PageTransition'
import { PlayerTile } from '../../components/PlayerTile'
import { PlayerTileSkeleton } from '../../components/Skeleton'
import { getPlayers } from '../../lib/players'
import { formatUsdt } from '../../lib/format'
import { squadValue } from '../../lib/players'
import { useSquadStore } from '../../stores/squadStore'

export function Squad() {
  const playerIds = useSquadStore((s) => s.userPlayerIds)
  const players = getPlayers(playerIds)
  const total = squadValue(playerIds)

  return (
    <PageTransition>
      <BlurInMount>
        <h1 className="font-display text-3xl text-[var(--text-primary)] md:text-4xl">Squad</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Full roster the agent manages. Total value{' '}
          <span className="font-mono text-[var(--accent)]">{formatUsdt(total)} USDt</span>
        </p>
      </BlurInMount>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {players.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <PlayerTileSkeleton key={i} />)
          : players.map((player, i) => (
              <BlurInMount key={player.id} delay={Math.min(0.03 * i, 0.35)}>
                <PlayerTile player={player} />
              </BlurInMount>
            ))}
      </div>
    </PageTransition>
  )
}
