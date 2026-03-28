import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { getRelationships, acceptRequest, declineRequest, unmatch, removeConnection } from '../api/requests'
import { getMatches, } from '../api/matches'

const sportColors = {
  tennis:     'bg-emerald-50 text-emerald-700',
  padel:      'bg-sky-50 text-sky-700',
  football:   'bg-green-50 text-green-700',
  basketball: 'bg-orange-50 text-orange-700',
  running:    'bg-rose-50 text-rose-700',
  cycling:    'bg-lime-50 text-lime-700',
  swimming:   'bg-blue-50 text-blue-700',
  golf:       'bg-teal-50 text-teal-700',
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDatetime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function Matches() {
  const { showToast } = useToast()

  // Direct match relationships (from /api/requests)
  const [confirmed, setConfirmed]           = useState([])
  const [pendingSent, setPendingSent]       = useState([])
  const [pendingReceived, setPendingReceived] = useState([])

  // Session-join requests (from /api/matches)
  const [sessionIncoming, setSessionIncoming] = useState([])
  const [sessionPending, setSessionPending]   = useState([])
  const [sessionConfirmed, setSessionConfirmed] = useState([])

  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [relData, matchData] = await Promise.all([
        getRelationships().catch(() => ({ relationships: [] })),
        getMatches().catch(() => ({ confirmed: [], pending: [], incoming: [] })),
      ])

      const all = relData.relationships || []
      setConfirmed(all.filter(r => r.status === 'accepted'))
      setPendingSent(all.filter(r => r.status === 'pending' && r.direction === 'sent'))
      setPendingReceived(all.filter(r => r.status === 'pending' && r.direction === 'received'))

      setSessionIncoming(matchData.incoming  || [])
      setSessionPending(matchData.pending    || [])
      setSessionConfirmed(matchData.confirmed || [])
    } catch (err) {
      console.error('loadAll error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Direct match handlers ─────────────────────────────────────────────────

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id)
      await loadAll()
      showToast('Match accepted!')
    } catch { showToast('Failed to accept.') }
  }

  const handleDecline = async (id) => {
    try {
      await declineRequest(id)
      setPendingReceived(prev => prev.filter(r => r.id !== id))
      showToast('Request declined.')
    } catch { showToast('Failed to decline.') }
  }

  const handleCancel = async (id) => {
    try {
      await removeConnection(id)
      setPendingSent(prev => prev.filter(r => r.id !== id))
      showToast('Request cancelled.')
    } catch { showToast('Failed to cancel.') }
  }

  const handleUnmatch = async (otherUserId) => {
    try {
      await unmatch(otherUserId)
      setConfirmed(prev => prev.filter(r => r.other_user_id !== otherUserId))
      showToast('Unmatched successfully.')
    } catch { showToast('Failed to unmatch.') }
  }

  // ── Session-join handlers ─────────────────────────────────────────────────

  const handleSessionAccept = async (id) => {
    try {
      await acceptRequest(id)
      await loadAll()
      showToast('Session request accepted!')
    } catch { showToast('Failed to accept.') }
  }

  const handleSessionDecline = async (id) => {
    try {
      await declineRequest(id)
      setSessionIncoming(prev => prev.filter(r => r.id !== id))
      showToast('Request declined.')
    } catch { showToast('Failed to decline.') }
  }

  const handleSessionRemove = async (id) => {
    try {
      await removeConnection(id)
      setSessionConfirmed(prev => prev.filter(r => r.id !== id))
      showToast('Connection removed.')
    } catch { showToast('Failed to remove.') }
  }

  if (loading) return <p className="text-sm text-text-muted font-body">Loading…</p>

  return (
    <div className="flex flex-col gap-10">

      {/* ── Incoming direct match requests ── */}
      {pendingReceived.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Match requests</h2>
            <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body">{pendingReceived.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {pendingReceived.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[r.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(r.other_user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{r.sport}{r.skill ? ` · ${r.skill}` : ''}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleDecline(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Decline</button>
                  <button onClick={() => handleAccept(r.id)} className="px-3 py-1.5 rounded-full bg-brand text-white text-xs hover:bg-brand/90 transition-colors font-body">Accept</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Incoming session-join requests ── */}
      {sessionIncoming.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Session requests</h2>
            <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body">{sessionIncoming.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {sessionIncoming.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[r.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(r.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize truncate">
                    {r.sport && `${r.sport} · `}{r.location || r.detail}
                    {r.datetime && ` · ${formatDatetime(r.datetime)}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleSessionDecline(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Decline</button>
                  <button onClick={() => handleSessionAccept(r.id)} className="px-3 py-1.5 rounded-full bg-brand text-white text-xs hover:bg-brand/90 transition-colors font-body">Accept</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Confirmed matches ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Confirmed matches</h2>
          <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body">{confirmed.length + sessionConfirmed.length}</span>
        </div>
        {confirmed.length === 0 && sessionConfirmed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-3xl mb-3">🤝</p>
            <p className="font-display text-base font-semibold text-text-main">No confirmed matches yet</p>
            <p className="text-xs text-text-muted font-body mt-1">Accept incoming requests or send one from Discover.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {confirmed.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[m.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(m.other_user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{m.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{m.sport}{m.skill ? ` · ${m.skill}` : ''}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => showToast('Messaging coming soon.')} className="px-4 py-1.5 rounded-full text-xs bg-brand text-white hover:bg-brand/90 transition-colors font-body">Message</button>
                  <button onClick={() => handleUnmatch(m.other_user_id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Unmatch</button>
                </div>
              </div>
            ))}
            {sessionConfirmed.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[m.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{m.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{m.detail}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => showToast('Messaging coming soon.')} className="px-4 py-1.5 rounded-full text-xs bg-brand text-white hover:bg-brand/90 transition-colors font-body">Message</button>
                  <button onClick={() => handleSessionRemove(m.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Awaiting response (sent by me, not yet accepted) ── */}
      {(pendingSent.length > 0 || sessionPending.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Awaiting response</h2>
            <span className="bg-border text-text-muted text-[10px] px-2 py-0.5 rounded-full font-body">{pendingSent.length + sessionPending.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {pendingSent.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[r.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(r.other_user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{r.sport}{r.skill ? ` · ${r.skill}` : ''}</p>
                </div>
                <button onClick={() => handleCancel(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body flex-shrink-0">Cancel</button>
              </div>
            ))}
            {sessionPending.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[r.sport] || 'bg-gray-50 text-gray-600'}`}>
                  {initials(r.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{r.detail}</p>
                </div>
                <span className="text-xs text-text-muted bg-brand-bg border border-border px-3 py-1.5 rounded-full font-body flex-shrink-0">Pending</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
