import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { getFriends, getPendingRequests, acceptFriendRequest, removeFriend } from '../api/friends'

const sportEmoji = {
  tennis: '🎾', padel: '🏓', football: '⚽', basketball: '🏀',
  running: '🏃', cycling: '🚴', swimming: '🏊', golf: '⛳',
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function FriendRow({ friend, onRemove }) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    setRemoving(true)
    await onRemove(friend.id)
    setRemoving(false)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 font-body">
        {initials(friend.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-main font-body">{friend.name}</p>
        {friend.sport && (
          <p className="text-xs text-text-muted font-body capitalize mt-0.5">
            {sportEmoji[friend.sport] || '🏅'} {friend.sport}{friend.skill ? ` · ${friend.skill}` : ''}
          </p>
        )}
      </div>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="text-xs text-text-muted hover:text-red-400 transition-colors font-body border border-border hover:border-red-300 px-3 py-1.5 rounded-full disabled:opacity-50"
      >
        {removing ? '…' : 'Unfriend'}
      </button>
    </div>
  )
}

function PendingRow({ request, onAccept, onDecline }) {
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  const handleAccept = async () => {
    setAccepting(true)
    await onAccept(request.id)
    setAccepting(false)
  }

  const handleDecline = async () => {
    setDeclining(true)
    await onDecline(request.id)
    setDeclining(false)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border">
      <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-semibold flex-shrink-0 font-body">
        {initials(request.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-main font-body">{request.name}</p>
        {request.sport && (
          <p className="text-xs text-text-muted font-body capitalize mt-0.5">
            {sportEmoji[request.sport] || '🏅'} {request.sport}{request.skill ? ` · ${request.skill}` : ''}
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleDecline}
          disabled={declining}
          className="text-xs text-text-muted border border-border px-3 py-1.5 rounded-full hover:border-red-300 hover:text-red-400 transition-colors font-body disabled:opacity-50"
        >
          {declining ? '…' : 'Decline'}
        </button>
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="text-xs text-white bg-brand px-3 py-1.5 rounded-full hover:bg-brand/90 transition-colors font-body disabled:opacity-50"
        >
          {accepting ? '…' : 'Accept'}
        </button>
      </div>
    </div>
  )
}

export default function Friends() {
  const { showToast } = useToast()
  const [friends, setFriends]   = useState([])
  const [pending, setPending]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getFriends(), getPendingRequests()])
      .then(([f, p]) => { setFriends(f); setPending(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id)
      const accepted = pending.find(r => r.id === id)
      setPending(prev => prev.filter(r => r.id !== id))
      if (accepted) {
        setFriends(prev => [...prev, {
          id,
          friendId: accepted.senderId,
          name: accepted.name,
          sport: accepted.sport,
          skill: accepted.skill,
        }])
      }
      showToast(`You and ${accepted?.name} are now friends!`)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to accept request')
    }
  }

  const handleDecline = async (id) => {
    try {
      await removeFriend(id)
      setPending(prev => prev.filter(r => r.id !== id))
      showToast('Request declined.')
    } catch {
      showToast('Failed to decline request.')
    }
  }

  const handleRemove = async (id) => {
    try {
      await removeFriend(id)
      setFriends(prev => prev.filter(f => f.id !== id))
      showToast('Friend removed.')
    } catch {
      showToast('Failed to remove friend.')
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted font-body">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-10">

      {/* Pending requests */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Friend requests</h2>
            <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-body">{pending.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {pending.map(r => (
              <PendingRow key={r.id} request={r} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Friends</h2>
          <span className="bg-border text-text-muted text-[10px] px-2 py-0.5 rounded-full font-body">{friends.length}</span>
        </div>
        {friends.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-3xl mb-3">👋</p>
            <p className="font-display text-base font-semibold text-text-main">No friends yet</p>
            <p className="text-xs text-text-muted font-body mt-1">
              Head to <span className="text-brand font-medium">Discover</span> and add players as friends.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {friends.map(f => (
              <FriendRow key={f.id} friend={f} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
