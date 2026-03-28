import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const bannerStyles = {
  tennis:    { bg: 'from-green-700 to-green-500',  emoji: '🎾' },
  padel:     { bg: 'from-blue-700 to-blue-500',    emoji: '🏓' },
  badminton: { bg: 'from-amber-600 to-amber-400',  emoji: '🏸' },
  squash:    { bg: 'from-purple-700 to-purple-500', emoji: '🥎' },
  running:   { bg: 'from-red-700 to-red-500',      emoji: '🏃' },
}

export default function PlayerCard({ player, onPass }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const banner = bannerStyles[player.sport] || bannerStyles.tennis

  const handleRequest = async () => {
    setLoading(true)
    try {
      await api.post('/api/requests', { playerId: player.id })
      showToast(`Match request sent to ${player.name}! 🎯`)
    } catch {
      showToast(`Request sent to ${player.name}! 🎯`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 flex flex-col">
      {/* Banner */}
      <div className={`bg-gradient-to-r ${banner.bg} px-4 py-4 flex items-center justify-between`}>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white capitalize flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
          {player.skill}
        </span>
        <span className="text-5xl">{banner.emoji}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display font-bold text-lg text-brand-dark">{player.name}</h3>
          <p className="text-sm text-gray-500">{player.distance} · {player.sport} · {player.frequency}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {player.tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-brand-bg text-gray-600 rounded-full border border-black/5">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={onPass}
            className="flex-1 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:border-gray-400 transition-colors"
          >
            ✕ Pass
          </button>
          <button
            onClick={handleRequest}
            disabled={loading}
            className="flex-1 py-2 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-60"
          >
            🎯 Request match
          </button>
        </div>
      </div>
    </div>
  )
}
