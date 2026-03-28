import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const sportMeta = {
  tennis:    { stripe: 'bg-emerald-700',  label: 'Tennis' },
  padel:     { stripe: 'bg-sky-700',      label: 'Padel' },
  badminton: { stripe: 'bg-amber-600',    label: 'Badminton' },
  squash:    { stripe: 'bg-violet-700',   label: 'Squash' },
  running:   { stripe: 'bg-rose-700',     label: 'Running' },
}

const skillWidth = { beginner: '33%', intermediate: '66%', advanced: '100%' }

export default function PlayerCard({ player, onPass }) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const meta = sportMeta[player.sport] || sportMeta.tennis

  const handleRequest = async () => {
    setLoading(true)
    try {
      await api.post('/api/requests', { playerId: player.id })
    } catch {}
    showToast(`Request sent to ${player.name}.`)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border flex flex-col hover:shadow-md transition-shadow">
      {/* Top stripe */}
      <div className={`h-1.5 w-full ${meta.stripe}`} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-text-main">{player.name}</h3>
            <p className="text-xs text-text-muted font-body mt-0.5">{player.distance} away · {player.frequency}</p>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-text-muted border border-border px-2 py-1 rounded font-body">
            {meta.label}
          </span>
        </div>

        {/* Skill bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body">Skill</span>
            <span className="text-[10px] text-text-muted font-body capitalize">{player.skill}</span>
          </div>
          <div className="h-0.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: skillWidth[player.skill] || '50%' }} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {player.tags.map((tag) => (
            <span key={tag} className="text-[11px] px-2.5 py-1 bg-brand-bg text-text-muted rounded-full border border-border font-body">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onPass}
            className="flex-1 py-2 rounded-full border border-border text-text-muted text-xs font-medium hover:border-brand hover:text-brand transition-colors font-body tracking-wide"
          >
            Decline
          </button>
          <button
            onClick={handleRequest}
            disabled={loading}
            className="flex-1 py-2 rounded-full bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 font-body tracking-wide"
          >
            Request to play
          </button>
        </div>
      </div>
    </div>
  )
}
