import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { sendRequest, acceptRequest, declineRequest, unmatch } from '../api/requests'
import { sendFriendRequest } from '../api/friends'

const sportMeta = {
  tennis:     { stripe: 'bg-emerald-500', label: 'Tennis' },
  padel:      { stripe: 'bg-cyan-500',    label: 'Padel' },
  football:   { stripe: 'bg-green-500',   label: 'Football' },
  basketball: { stripe: 'bg-orange-500',  label: 'Basketball' },
  running:    { stripe: 'bg-rose-500',    label: 'Running' },
  cycling:    { stripe: 'bg-lime-500',    label: 'Cycling' },
  swimming:   { stripe: 'bg-sky-500',     label: 'Swimming' },
  golf:       { stripe: 'bg-green-600',   label: 'Golf' },
}

const skillWidth = { beginner: '33%', intermediate: '66%', advanced: '100%' }

// Normalise the raw relationship object from the API into one of four states:
// 'none' | 'pending_sent' | 'pending_received' | 'accepted'
function toMatchStatus(rel, currentUserId) {
  if (!rel) return 'none'
  if (rel.status === 'accepted') return 'accepted'
  if (rel.status === 'pending') {
    return Number(rel.from_user) === Number(currentUserId) ? 'pending_sent' : 'pending_received'
  }
  return 'none'
}

export default function PlayerCard({ player, onPass, matchRel = null, currentUserId = null, initialFriendStatus = 'none' }) {
  const { showToast } = useToast()

  // Match/play relationship state
  const [rel, setRel] = useState(matchRel)         // raw relationship object { id, status, from_user, to_user }
  const matchStatus = toMatchStatus(rel, currentUserId)

  // Friend relationship state
  const [friendStatus, setFriendStatus] = useState(
    initialFriendStatus === 'accepted'         ? 'friends' :
    initialFriendStatus === 'pending_sent'     ? 'sent' :
    initialFriendStatus === 'pending_received' ? 'sent' : 'none'
  )

  const [loading, setLoading] = useState(false)
  const meta = sportMeta[player.sport] || sportMeta.tennis

  // ── Match request actions ──────────────────────────────────────────────────

  const handleSendRequest = async () => {
    if (Number(player.id) === Number(currentUserId)) return // guard: no self-requests
    setLoading(true)
    try {
      const data = await sendRequest({ playerId: player.id })
      setRel(data.request || { id: null, status: 'pending', from_user: currentUserId, to_user: player.id })
      // Persist to localStorage so the accepted-notification hook can detect the transition
      try {
        const stored = JSON.parse(localStorage.getItem('sinder_pending_sent') || '{}')
        stored[player.id] = player.name
        localStorage.setItem('sinder_pending_sent', JSON.stringify(stored))
      } catch {}
      showToast(`✅ Match request sent to ${player.name}!`)
    } catch (err) {
      const msg = err?.response?.data?.error
      if (msg?.includes('already exists')) {
        setRel({ id: null, status: 'pending', from_user: currentUserId, to_user: player.id })
      } else {
        showToast(msg || 'Failed to send request.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!rel?.id) return
    setLoading(true)
    try {
      await acceptRequest(rel.id)
      setRel(prev => ({ ...prev, status: 'accepted' }))
      showToast(`Matched with ${player.name}!`)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to accept.')
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!rel?.id) return
    setLoading(true)
    try {
      await declineRequest(rel.id)
      setRel(null)
      showToast('Request declined.')
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to decline.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnmatch = async () => {
    setLoading(true)
    try {
      await unmatch(player.id)
      setRel(null)
      showToast(`Unmatched from ${player.name}.`)
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to unmatch.')
    } finally {
      setLoading(false)
    }
  }

  // ── Friend request action ──────────────────────────────────────────────────

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(player.id)
      setFriendStatus('sent')
      showToast(`Friend request sent to ${player.name}.`)
    } catch (err) {
      const msg = err?.response?.data?.error
      if (msg === 'Already friends') setFriendStatus('friends')
      else if (msg === 'Friend request already sent') setFriendStatus('sent')
      else showToast(msg || 'Failed to send friend request.')
    }
  }

  // ── Render match-request button based on current state ────────────────────

  const renderMatchButton = () => {
    if (matchStatus === 'accepted') {
      return (
        <button
          onClick={handleUnmatch}
          disabled={loading}
          className="flex-1 py-2 rounded-full border border-red-300 text-red-400 text-xs font-medium hover:bg-red-50 transition-colors font-body tracking-wide disabled:opacity-50"
        >
          {loading ? '…' : 'Unmatch'}
        </button>
      )
    }

    if (matchStatus === 'pending_sent') {
      return (
        <button disabled className="flex-1 py-2 rounded-full bg-border text-text-muted text-xs font-medium cursor-default font-body tracking-wide">
          ✓ Request sent
        </button>
      )
    }

    if (matchStatus === 'pending_received') {
      return (
        <>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="flex-1 py-2 rounded-full border border-border text-text-muted text-xs font-medium hover:border-red-300 hover:text-red-400 transition-colors font-body disabled:opacity-50"
          >
            {loading ? '…' : 'Decline'}
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 py-2 rounded-full bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors font-body disabled:opacity-50"
          >
            {loading ? '…' : 'Accept'}
          </button>
        </>
      )
    }

    // status === 'none'
    return (
      <>
        <button
          onClick={onPass}
          className="flex-1 py-2 rounded-full border border-border text-text-muted text-xs font-medium hover:border-brand hover:text-brand transition-colors font-body tracking-wide"
        >
          Pass
        </button>
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="flex-1 py-2 rounded-full bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors font-body tracking-wide disabled:opacity-50"
        >
          {loading ? '…' : 'Request match'}
        </button>
      </>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border flex flex-col hover:shadow-md transition-shadow">
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
          {player.tags?.map((tag) => (
            <span key={tag} className="text-[11px] px-2.5 py-1 bg-brand-bg text-text-muted rounded-full border border-border font-body">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <div className="flex gap-2">
            {renderMatchButton()}
          </div>
          {/* Friend button — separate from match relationship */}
          <button
            onClick={handleAddFriend}
            disabled={friendStatus !== 'none'}
            className={`w-full py-2 rounded-full border text-xs font-medium transition-colors font-body tracking-wide ${
              friendStatus === 'sent'    ? 'border-border text-text-muted cursor-default' :
              friendStatus === 'friends' ? 'border-green-300 text-green-600 cursor-default' :
              'border-border text-text-muted hover:border-brand hover:text-brand'
            }`}
          >
            {friendStatus === 'sent' ? '✓ Friend request sent' : friendStatus === 'friends' ? '✓ Friends' : '+ Add friend'}
          </button>
        </div>
      </div>
    </div>
  )
}
