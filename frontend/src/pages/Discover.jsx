import { useState, useEffect } from 'react'
import SportFilter from '../components/SportFilter'
import PlayerCard from '../components/PlayerCard'
import api from '../api/axios'

const mockPlayers = [
  { id: 1, name: 'Sarah T.', sport: 'tennis', skill: 'intermediate', distance: '0.4 mi', frequency: '2x/week', tags: ['Weekend mornings', 'Singles', 'Competitive'] },
  { id: 2, name: 'James M.', sport: 'padel', skill: 'beginner', distance: '0.8 mi', frequency: 'Learning', tags: ['Weekends', 'Friendly games'] },
  { id: 3, name: 'Priya K.', sport: 'badminton', skill: 'intermediate', distance: '1.2 mi', frequency: '3x/week', tags: ['Weekday mornings', 'Mixed doubles'] },
  { id: 4, name: 'Tom R.', sport: 'squash', skill: 'advanced', distance: '1.8 mi', frequency: '4x/week', tags: ['Evenings', 'Competitive'] },
  { id: 5, name: 'Chloe F.', sport: 'running', skill: 'beginner', distance: '0.6 mi', frequency: '2x/week', tags: ['Early mornings', '5K pace'] },
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

  const visible = players.filter(
    (p) => !passed.has(p.id) && (!sport || p.sport === sport)
  )

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      {visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🎾</p>
          <p className="font-medium">No more players nearby</p>
          <p className="text-sm mt-1">Try a different sport or check back later</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {visible.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onPass={() => setPassed((prev) => new Set([...prev, player.id]))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
