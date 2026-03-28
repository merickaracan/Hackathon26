import { useState, useEffect } from 'react'
import SportFilter from '../components/SportFilter'
import PlayerCard from '../components/PlayerCard'
import api from '../api/axios'

const mockPlayers = [
  { id: 1, name: 'Sarah T.',  sport: 'tennis',    skill: 'intermediate', distance: '0.4 mi', frequency: '2× week', tags: ['Weekend mornings', 'Singles', 'Competitive'] },
  { id: 2, name: 'James M.', sport: 'padel',     skill: 'beginner',     distance: '0.8 mi', frequency: 'Casual',  tags: ['Weekends', 'Friendly games'] },
  { id: 3, name: 'Priya K.', sport: 'badminton', skill: 'intermediate', distance: '1.2 mi', frequency: '3× week', tags: ['Weekday mornings', 'Mixed doubles'] },
  { id: 4, name: 'Tom R.',   sport: 'squash',    skill: 'advanced',     distance: '1.8 mi', frequency: '4× week', tags: ['Evenings', 'Competitive'] },
  { id: 5, name: 'Chloe F.', sport: 'running',   skill: 'beginner',     distance: '0.6 mi', frequency: '2× week', tags: ['Early mornings', '5K pace'] },
]

export default function Discover() {
  const [sport, setSport] = useState('')
  const [players, setPlayers] = useState(mockPlayers)
  const [passed, setPassed] = useState(new Set())

  useEffect(() => {
    api.get('/api/players/nearby', { params: { sport } })
      .then((res) => setPlayers(res.data))
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
              onPass={() => setPassed(prev => new Set([...prev, player.id]))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
