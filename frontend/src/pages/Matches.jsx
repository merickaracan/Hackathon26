import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { getRelationships, acceptRequest, declineRequest, unmatch, removeConnection } from '../api/requests'
import { getMatches } from '../api/matches'

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

function Avatar({ name, sport }) {
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 font-body ${sportColors[sport] || 'bg-gray-50 text-gray-600'}`}>
      {initials(name)}
    </div>
  )
}

export default function Matches() {
  const { showToast } = useToast()

  // Direct match relationships
  const [confirmed, setConfirmed]             = useState([])
  const [pendingSent, setPendingSent]         = useState([])
  const [pendingReceived, setPendingReceived] = useState([])

  // Session-join requests
  const [sessionConfirmed, setSessionConfirmed] = useState([])
  const [sessionIncoming, setSessionIncoming]   = useState([])
  const [sessionPending, setSessionPending]     = useState([])

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

      setSessionConfirmed(matchData.confirmed || [])
      setSessionIncoming(matchData.incoming   || [])
      setSessionPending(matchData.pending     || [])
    } catch (err) {
      console.error('loadAll error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAccept = async (id) => {
    try { await acceptRequest(id); await loadAll(); showToast('Match accepted!') }
    catch { showToast('Failed to accept.') }
  }

  const handleDecline = async (id) => {
    try { await declineRequest(id); setPendingReceived(p => p.filter(r => r.id !== id)); showToast('Request declined.') }
    catch { showToast('Failed to decline.') }
  }

  const handleCancel = async (id) => {
    try { await removeConnection(id); setPendingSent(p => p.filter(r => r.id !== id)); showToast('Request cancelled.') }
    catch { showToast('Failed to cancel.') }
  }

  const handleUnmatch = async (otherUserId) => {
    try { await unmatch(otherUserId); setConfirmed(p => p.filter(r => r.other_user_id !== otherUserId)); showToast('Unmatched.') }
    catch { showToast('Failed to unmatch.') }
  }

  const handleSessionAccept = async (id) => {
    try { await acceptRequest(id); await loadAll(); showToast('Session request accepted!') }
    catch { showToast('Failed to accept.') }
  }

  const handleSessionDecline = async (id) => {
    try { await declineRequest(id); setSessionIncoming(p => p.filter(r => r.id !== id)); showToast('Request declined.') }
    catch { showToast('Failed to decline.') }
  }

  const handleSessionRemove = async (id) => {
    try { await removeConnection(id); setSessionConfirmed(p => p.filter(r => r.id !== id)); showToast('Connection removed.') }
    catch { showToast('Failed to remove.') }
  }

  if (loading) return <p className="text-sm text-text-muted font-body">Loading…</p>

  const pendingCount  = pendingReceived.length + sessionIncoming.length + pendingSent.length + sessionPending.length
  const acceptedCount = confirmed.length + sessionConfirmed.length

  return (
    <div className="flex flex-col gap-3">

      {/* ══ SECTION 1: PENDING ══════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold tracking-tight text-text-main">Pending requests</h2>
          {pendingCount > 0 && (
            <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body font-medium">{pendingCount}</span>
          )}
        </div>

        {pendingCount === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-2xl mb-2">📬</p>
            <p className="text-sm font-semibold text-text-main font-body">No pending requests</p>
            <p className="text-xs text-text-muted font-body mt-1">Incoming and outgoing requests will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">

            {/* Incoming direct match requests */}
            {pendingReceived.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={r.other_user_name} sport={r.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{r.sport}{r.skill ? ` · ${r.skill}` : ''}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold font-body mr-2 flex-shrink-0">Incoming</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleDecline(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Decline</button>
                  <button onClick={() => handleAccept(r.id)} className="px-3 py-1.5 rounded-full bg-brand text-white text-xs hover:bg-brand/90 transition-colors font-body">Accept</button>
                </div>
              </div>
            ))}

            {/* Incoming session-join requests */}
            {sessionIncoming.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={r.name} sport={r.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize truncate">
                    {r.sport && `${r.sport} · `}{r.location || r.detail}
                    {r.datetime && ` · ${formatDatetime(r.datetime)}`}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold font-body mr-2 flex-shrink-0">Session</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleSessionDecline(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Decline</button>
                  <button onClick={() => handleSessionAccept(r.id)} className="px-3 py-1.5 rounded-full bg-brand text-white text-xs hover:bg-brand/90 transition-colors font-body">Accept</button>
                </div>
              </div>
            ))}

            {/* Outgoing direct match requests */}
            {pendingSent.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={r.other_user_name} sport={r.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{r.sport}{r.skill ? ` · ${r.skill}` : ''}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold font-body mr-2 flex-shrink-0">Awaiting</span>
                <button onClick={() => handleCancel(r.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body flex-shrink-0">Cancel</button>
              </div>
            ))}

            {/* Outgoing session-join requests */}
            {sessionPending.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={r.name} sport={r.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{r.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize truncate">{r.detail}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold font-body flex-shrink-0">Awaiting</span>
              </div>
            ))}

          </div>
        )}
      </section>

      {/* ══ SECTION 2: ACCEPTED ═════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold tracking-tight text-text-main">Accepted</h2>
          {acceptedCount > 0 && (
            <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body font-medium">{acceptedCount}</span>
          )}
        </div>

        {acceptedCount === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-2xl mb-2">🤝</p>
            <p className="text-sm font-semibold text-text-main font-body">No accepted requests yet</p>
            <p className="text-xs text-text-muted font-body mt-1">Once you accept or get accepted, connections show here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">

            {/* Confirmed direct matches */}
            {confirmed.map(m => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={m.other_user_name} sport={m.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{m.other_user_name}</p>
                  <p className="text-xs text-text-muted font-body capitalize">{m.sport}{m.skill ? ` · ${m.skill}` : ''}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold font-body mr-2 flex-shrink-0">Match</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => showToast('Messaging coming soon.')} className="px-4 py-1.5 rounded-full text-xs bg-brand text-white hover:bg-brand/90 transition-colors font-body">Message</button>
                  <button onClick={() => handleUnmatch(m.other_user_id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Unmatch</button>
                </div>
              </div>
            ))}

            {/* Confirmed session connections */}
            {sessionConfirmed.map(m => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar name={m.name} sport={m.sport} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-main text-sm font-body">{m.name}</p>
                  <p className="text-xs text-text-muted font-body capitalize truncate">{m.detail}</p>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand font-semibold font-body mr-2 flex-shrink-0">Session</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => showToast('Messaging coming soon.')} className="px-4 py-1.5 rounded-full text-xs bg-brand text-white hover:bg-brand/90 transition-colors font-body">Message</button>
                  <button onClick={() => handleSessionRemove(m.id)} className="px-3 py-1.5 rounded-full border border-border text-xs text-text-muted hover:border-red-300 hover:text-red-400 transition-colors font-body">Remove</button>
                </div>
              </div>
            ))}

          </div>
        )}
      </section>

    </div>
  )
}
