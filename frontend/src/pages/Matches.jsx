import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const sportColors = {
  tennis:    'bg-emerald-50 text-emerald-700',
  padel:     'bg-sky-50 text-sky-700',
  badminton: 'bg-amber-50 text-amber-700',
  squash:    'bg-violet-50 text-violet-700',
  running:   'bg-rose-50 text-rose-700',
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
  const [pending, setPending]     = useState(mockPending)

  useEffect(() => {
    api.get('/api/matches')
      .then((res) => {
        setConfirmed(res.data.confirmed || mockConfirmed)
        setPending(res.data.pending   || mockPending)
      })
      .catch(() => {})
  }, [])

  const MatchRow = ({ match, isPending }) => (
    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[match.sport] || 'bg-gray-50 text-gray-600'}`}>
        {match.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text-main text-sm font-body">{match.name}</p>
        <p className="text-xs text-text-muted truncate font-body capitalize">{match.detail}</p>
      </div>
      {isPending ? (
        <span className="text-xs text-text-muted bg-brand-bg border border-border px-3 py-1.5 rounded-full font-body">
          Pending
        </span>
      ) : (
        <button
          onClick={() => showToast('Messaging coming soon.')}
          className="px-4 py-1.5 rounded-full text-xs bg-brand text-white hover:bg-brand/90 transition-colors font-body tracking-wide"
        >
          Message
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl flex flex-col gap-10">
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Confirmed partners</h2>
          <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body">{confirmed.length}</span>
        </div>
        <div className="flex flex-col gap-3">
          {confirmed.map((m) => <MatchRow key={m.id} match={m} isPending={false} />)}
          {confirmed.length === 0 && <p className="text-text-muted text-sm font-body">No confirmed partners yet.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Pending requests</h2>
          <span className="bg-border text-text-muted text-[10px] px-2 py-0.5 rounded-full font-body">{pending.length}</span>
        </div>
        <div className="flex flex-col gap-3">
          {pending.map((m) => <MatchRow key={m.id} match={m} isPending={true} />)}
          {pending.length === 0 && <p className="text-text-muted text-sm font-body">No pending requests.</p>}
        </div>
      </section>
    </div>
  )
}
