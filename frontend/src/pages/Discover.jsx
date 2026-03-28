import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import SportFilter from '../components/SportFilter'
import PlayerCard from '../components/PlayerCard'
import { getNearbyPlayers } from '../api/players'
import { getFriendStatuses } from '../api/friends'
import { getRelationshipStatuses } from '../api/requests'

const mockPlayers = [
  { id: 1, name: 'Sarah T.',  sport: 'tennis',     skill: 'intermediate', distance: '0.4 mi', frequency: '2× week', tags: ['Weekend mornings', 'Singles', 'Competitive'] },
  { id: 2, name: 'James M.', sport: 'padel',      skill: 'beginner',     distance: '0.8 mi', frequency: 'Casual',  tags: ['Weekends', 'Friendly games'] },
  { id: 3, name: 'Priya K.', sport: 'football',   skill: 'intermediate', distance: '1.2 mi', frequency: '3× week', tags: ['Weekday evenings', '5-a-side'] },
  { id: 4, name: 'Tom R.',   sport: 'basketball', skill: 'advanced',     distance: '1.8 mi', frequency: '4× week', tags: ['Evenings', 'Competitive'] },
  { id: 5, name: 'Chloe F.', sport: 'running',    skill: 'beginner',     distance: '0.6 mi', frequency: '2× week', tags: ['Early mornings', '5K pace'] },
]

export default function Discover() {
  const { user } = useAuth()
  const [sport, setSport] = useState('')
  const [players, setPlayers] = useState(mockPlayers)
  const [passed, setPassed] = useState(new Set())

  // { [playerId]: { id, status, direction } }  — match relationship states
  const [matchStatuses, setMatchStatuses] = useState({})
  // { [playerId]: 'none'|'pending_sent'|'pending_received'|'accepted' } — friend states
  const [friendStatuses, setFriendStatuses] = useState({})

  // Fetch both status maps once on mount
  useEffect(() => {
    getRelationshipStatuses().then(setMatchStatuses).catch(() => {})
    getFriendStatuses().then(setFriendStatuses).catch(() => {})
  }, [])

  useEffect(() => {
    getNearbyPlayers(sport)
      .then(setPlayers)
      .catch(() => setPlayers(mockPlayers))
  }, [sport])

  const visible = players.filter(p => !passed.has(p.id) && (!sport || p.sport === sport))

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      {visible.length === 0 ? (
        <div className="text-center py-24 text-text-muted">
          <p className="font-display text-4xl font-semibold text-text-main mb-2">All caught up</p>
          <p className="text-sm font-body">No more players nearby — check back later or try a different sport.</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {visible.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              currentUserId={user?.id}
              matchRel={matchStatuses[player.id]
                ? {
                    id:        matchStatuses[player.id].id,
                    status:    matchStatuses[player.id].status,
                    from_user: matchStatuses[player.id].direction === 'sent' ? user?.id : player.id,
                    to_user:   matchStatuses[player.id].direction === 'sent' ? player.id : user?.id,
                  }
                : null
              }
              initialFriendStatus={friendStatuses[player.id] || 'none'}
              onPass={() => setPassed(prev => new Set([...prev, player.id]))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
