import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import SportFilter, { SPORT_FILTER_OPTIONS, sportFilterLabel } from '../components/SportFilter'
import PlayerCard from '../components/PlayerCard'
import { getNearbyPlayers } from '../api/players'
import { getRelationshipStatuses } from '../api/requests'

export default function Discover() {
  const { user } = useAuth()
  const [sport, setSport] = useState('')
  const [players, setPlayers] = useState([])

  // { [playerId]: { id, status, direction } }  — match relationship states
  const [matchStatuses, setMatchStatuses] = useState({})

  const refreshMatchStatuses = useCallback(() => {
    getRelationshipStatuses().then(setMatchStatuses).catch(() => {})
  }, [])

  // Fetch status maps on mount (PlayerCard syncs when this data arrives after first paint)
  useEffect(() => {
    refreshMatchStatuses()
  }, [refreshMatchStatuses])

  useEffect(() => {
    getNearbyPlayers(sport)
      .then(setPlayers)
      .catch(() => setPlayers([]))
  }, [sport])

  const statusForPlayer = (playerId) => {
    if (playerId == null) return null
    const m = matchStatuses[playerId] ?? matchStatuses[String(playerId)]
    return m ?? null
  }

  const visible = useMemo(
    () =>
      players.filter(
        (p) =>
          (!sport || p.sport === sport) &&
          (user?.id == null || Number(p.id) !== Number(user.id))
      ),
    [players, sport, user?.id]
  )

  /** When “All Sports” is selected, group cards by sport for easier scanning. */
  const groupedBySport = useMemo(() => {
    if (sport !== '') return []
    const bySport = new Map()
    for (const p of visible) {
      const key = String(p.sport || 'unknown').toLowerCase()
      if (!bySport.has(key)) bySport.set(key, [])
      bySport.get(key).push(p)
    }
    const knownOrder = SPORT_FILTER_OPTIONS.map((o) => o.value).filter(Boolean)
    const keys = [
      ...knownOrder.filter((k) => bySport.has(k)),
      ...[...bySport.keys()].filter((k) => !knownOrder.includes(k)).sort(),
    ]
    return keys.map((sportKey) => ({ sportKey, players: bySport.get(sportKey) }))
  }, [sport, visible])

  const gridClass = 'grid gap-5'
  const gridStyle = { gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }

  const renderPlayerCard = (player) => {
    const st = statusForPlayer(player.id)
    return (
      <PlayerCard
        key={player.id}
        player={player}
        currentUserId={user?.id}
        matchRel={
          st
            ? {
                id: st.id,
                status: st.status,
                from_user: st.direction === 'sent' ? user?.id : player.id,
                to_user: st.direction === 'sent' ? player.id : user?.id,
              }
            : null
        }
        onMatchStatusesInvalidate={refreshMatchStatuses}
      />
    )
  }

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      {visible.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
          <p className="font-display text-4xl font-semibold text-text-main mb-2">All caught up</p>
          <p className="text-sm font-body">No more players nearby — check back later or try a different sport.</p>
        </div>
      ) : sport === '' ? (
        <div className="flex flex-col gap-10">
          {groupedBySport.map(({ sportKey, players: groupPlayers }) => (
            <section key={sportKey} aria-labelledby={`discover-sport-${sportKey}`}>
              <h2
                id={`discover-sport-${sportKey}`}
                className="font-display text-lg font-semibold tracking-tight text-text-main mb-4 pb-2 border-b border-border"
              >
                {sportFilterLabel(sportKey)}
              </h2>
              <div className={gridClass} style={gridStyle}>
                {groupPlayers.map(renderPlayerCard)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={gridClass} style={gridStyle}>
          {visible.map(renderPlayerCard)}
        </div>
      )}
    </div>
  )
}
