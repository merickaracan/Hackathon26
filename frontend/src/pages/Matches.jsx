import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const sportIcons = { tennis: '🎾', padel: '🏓', badminton: '🏸', squash: '🥎', running: '🏃' }
const sportColors = {
  tennis: 'bg-green-100 text-green-700',
  padel: 'bg-blue-100 text-blue-700',
  badminton: 'bg-amber-100 text-amber-700',
  squash: 'bg-purple-100 text-purple-700',
  running: 'bg-red-100 text-red-700',
}

const mockConfirmed = [
  { id: 1, name: 'Sarah T.', detail: 'Tennis · 0.4 mi away', sport: 'tennis' },
  { id: 2, name: 'Priya K.', detail: 'Badminton · 1.2 mi away', sport: 'badminton' },
]
const mockPending = [
  { id: 3, name: 'Tom R.', detail: 'Squash · Sent 2 hrs ago', sport: 'squash' },
]

export default function Matches() {
  const { showToast } = useToast()
  const [confirmed, setConfirmed] = useState(mockConfirmed)
  const [pending, setPending] = useState(mockPending)

  useEffect(() => {
    api.get('/api/matches')
      .then((res) => {
        setConfirmed(res.data.confirmed || mockConfirmed)
        setPending(res.data.pending || mockPending)
      })
      .catch(() => {})
  }, [])

  const MatchRow = ({ match, isPending }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-black/5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${sportColors[match.sport] || 'bg-gray-100'}`}>
        {sportIcons[match.sport] || '🏅'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-dark text-sm">{match.name}</p>
        <p className="text-xs text-gray-400 truncate">{match.detail}</p>
      </div>
      {isPending ? (
        <button disabled className="px-4 py-1.5 rounded-full text-sm text-gray-400 bg-gray-100 cursor-not-allowed">
          Pending…
        </button>
      ) : (
        <button
          onClick={() => showToast('Messaging coming soon! 💬')}
          className="px-4 py-1.5 rounded-full text-sm bg-brand text-white hover:bg-brand/90 transition-colors"
        >
          Message
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-bold text-brand-dark">Confirmed matches</h2>
          <span className="bg-brand text-white text-xs px-2 py-0.5 rounded-full">{confirmed.length}</span>
        </div>
        <div className="flex flex-col gap-3">
          {confirmed.map((m) => <MatchRow key={m.id} match={m} isPending={false} />)}
          {confirmed.length === 0 && <p className="text-gray-400 text-sm">No confirmed matches yet.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-bold text-brand-dark">Pending requests</h2>
          <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
        </div>
        <div className="flex flex-col gap-3">
          {pending.map((m) => <MatchRow key={m.id} match={m} isPending={true} />)}
          {pending.length === 0 && <p className="text-gray-400 text-sm">No pending requests.</p>}
        </div>
      </section>
    </div>
  )
}
