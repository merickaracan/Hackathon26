import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { getMyPosts, updateScore } from '../api/posts'
import { updateNotifications } from '../api/users'
import EditProfileModal from '../components/EditProfileModal'


const sportEmoji = {
  tennis: '🎾', padel: '🏓', football: '⚽', basketball: '🏀',
  running: '🏃', cycling: '🚴', swimming: '🏊', golf: '⛳',
}

const notifLabels = {
  matchRequest:  'Match request received',
  matchAccepted: 'Match request accepted',
  reminder24h:   'Session reminder (24h)',
  reminder2h:    'Session reminder (2h)',
  newPlayers:    'New players near you',
  postExpiring:  'Post expiring soon',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ScoreInput({ sessionId, initial, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!value.trim()) return
    setSaving(true)
    try {
      await updateScore(sessionId, value.trim())
      onSaved(sessionId, value.trim())
      setEditing(false)
    } catch {
      // noop
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          placeholder="e.g. 6-4, 7-5"
          className="text-xs border border-border rounded-lg px-2.5 py-1.5 w-36 font-body text-text-main focus:outline-none focus:border-brand"
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-xs text-white bg-brand px-2.5 py-1.5 rounded-lg font-body font-medium hover:bg-brand/90 transition-colors"
        >
          {saving ? '…' : 'Save'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-text-muted font-body hover:text-text-main"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs font-body text-text-muted">
        Score: <span className="text-text-main font-medium">{initial || '—'}</span>
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-[10px] text-brand font-body hover:underline"
      >
        {initial ? 'Edit' : '+ Add score'}
      </button>
    </div>
  )
}

export default function Profile() {
  const { showToast } = useToast()
  const { user, profile, setUser, setProfile } = useAuth()

  const [notifs, setNotifs] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sessions')
  const [editOpen, setEditOpen] = useState(false)

  // Notification prefs
  useEffect(() => {
    if (!profile) return
    setNotifs({
      matchRequest:  profile.notif_match_request  ?? true,
      matchAccepted: profile.notif_match_accepted ?? true,
      reminder24h:   profile.notif_reminder_24h   ?? true,
      reminder2h:    profile.notif_reminder_2h    ?? false,
      newPlayers:    profile.notif_new_players    ?? false,
      postExpiring:  profile.notif_post_expiring  ?? true,
    })
  }, [profile])

  // Past sessions
  useEffect(() => {
    setSessionsLoading(true)
    getMyPosts()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false))
  }, [])

  const toggle = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    try { await updateNotifications(updated) } catch {}
    showToast('Preferences updated.')
  }

  const handleScoreSaved = (id, score) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, score } : s))
    showToast('Score saved.')
  }

  const handleProfileSaved = (updated) => {
    setProfile(prev => ({ ...prev, ...updated }))
    if (updated.name && updated.name !== user?.name) {
      setUser(prev => ({ ...prev, name: updated.name }))
    }
    showToast('Profile updated.')
  }

  const name     = profile?.name  || user?.name  || '—'
  const uni      = profile?.university || null
  const location = profile?.location   || null
  const sports   = profile?.sports     || []
  const initials = name !== '—'
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const memberSince = profile?.created_at ? formatDate(profile.created_at) : null

  const pastSessions = sessions.filter(s => new Date(s.datetime) < new Date())
  const upcomingSessions = sessions.filter(s => new Date(s.datetime) >= new Date())

  return (
    <div className="space-y-6">

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {/* colour band */}
        <div className="h-24 bg-gradient-to-r from-brand to-brand/60" />
        <div className="px-7 pb-7">
          {/* avatar lifted into the band */}
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-brand flex items-center justify-center text-white text-2xl font-bold font-display shadow-sm">
              {initials}
            </div>
            <button onClick={() => setEditOpen(true)} className="mb-1 px-4 py-2 rounded-full border border-border text-xs font-medium text-text-muted hover:border-brand hover:text-brand transition-colors font-body">
              Edit profile
            </button>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-main">{name}</h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {uni && (
              <span className="text-xs text-text-muted font-body flex items-center gap-1">
                🎓 {uni}
              </span>
            )}
            {location && (
              <span className="text-xs text-text-muted font-body flex items-center gap-1">
                📍 {location}
              </span>
            )}
            {memberSince && (
              <span className="text-xs text-text-muted font-body flex items-center gap-1">
                🗓 Member since {memberSince}
              </span>
            )}
          </div>

          {/* sport pills */}
          {sports.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {sports.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-brand-tint text-brand text-xs font-medium px-3 py-1 rounded-full font-body capitalize"
                >
                  {sportEmoji[s.sport] || '🏅'} {s.sport}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: sports & skills ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-5 font-body">
              Sports &amp; skills
            </p>

            {sports.length > 0 ? (
              <div className="flex flex-col gap-5">
                {sports.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-sm mb-2 font-body">
                      <span className="font-medium text-text-main capitalize flex items-center gap-1.5">
                        {sportEmoji[s.sport] || '🏅'} {s.sport}
                      </span>
                      <span className="text-[11px] text-text-muted capitalize bg-border/60 px-2 py-0.5 rounded-full">
                        {s.skill}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted font-body">No sports added yet.</p>
            )}
          </div>

          {/* stats strip */}
          <div className="bg-white rounded-2xl p-6 border border-border">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-4 font-body">
              Activity
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Sessions', sessions.length],
                ['Played', pastSessions.length],
                ['Upcoming', upcomingSessions.length],
                ['Sports', sports.length],
              ].map(([label, val]) => (
                <div key={label} className="text-center">
                  <p className="font-display text-2xl font-semibold text-text-main">{val}</p>
                  <p className="text-[11px] text-text-muted font-body mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: sessions + notifications ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* tab bar */}
          <div className="flex gap-1 bg-white border border-border rounded-xl p-1 w-fit">
            {[['sessions', 'Sessions'], ['notifs', 'Notifications']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-body font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-brand text-white'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Sessions tab ── */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="bg-white rounded-2xl p-6 border border-border">
                  <p className="text-sm text-text-muted font-body">Loading sessions…</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-border text-center">
                  <p className="text-3xl mb-3">🎾</p>
                  <p className="font-display text-base font-semibold text-text-main">No sessions yet</p>
                  <p className="text-xs text-text-muted font-body mt-1">Post a session to see your game history here.</p>
                </div>
              ) : (
                <>
                  {upcomingSessions.length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-3 font-body">
                        Upcoming
                      </p>
                      <div className="flex flex-col gap-3">
                        {upcomingSessions.map(s => (
                          <SessionCard key={s.id} session={s} onScoreSaved={handleScoreSaved} upcoming />
                        ))}
                      </div>
                    </div>
                  )}

                  {pastSessions.length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-3 font-body">
                        {upcomingSessions.length > 0 ? 'Past games' : 'Past games'}
                      </p>
                      <div className="flex flex-col gap-3">
                        {pastSessions.map(s => (
                          <SessionCard key={s.id} session={s} onScoreSaved={handleScoreSaved} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Notifications tab ── */}
          {activeTab === 'notifs' && (
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h2 className="font-display text-base font-semibold tracking-tight text-text-main mb-1">
                Email notifications
              </h2>
              <p className="text-xs text-text-muted font-body mb-6">
                Choose what you want to be notified about
              </p>

              {notifs ? (
                <div className="flex flex-col gap-5">
                  {Object.entries(notifLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-text-main font-body">{label}</span>
                      <button
                        onClick={() => toggle(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${notifs[key] ? 'bg-brand' : 'bg-border'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted font-body">Loading preferences…</p>
              )}
            </div>
          )}

        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  )
}

function SessionCard({ session, onScoreSaved, upcoming = false }) {
  const emoji = sportEmoji[session.sport] || '🏅'
  const date = formatDate(session.datetime)
  const time = session.datetime
    ? new Date(session.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={`bg-white rounded-xl p-4 border font-body transition-shadow hover:shadow-sm ${upcoming ? 'border-brand/30 bg-brand-tint/20' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${upcoming ? 'bg-brand/10' : 'bg-border/50'}`}>
            {emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-text-main capitalize">{session.sport}</span>
              <span className="text-[10px] bg-border/60 text-text-muted px-2 py-0.5 rounded-full">{session.format}</span>
              {upcoming && (
                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">Upcoming</span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              📍 {session.location} · {date}{time ? ` · ${time}` : ''}
            </p>
            {session.description && (
              <p className="text-xs text-text-muted mt-1 line-clamp-1 italic">"{session.description}"</p>
            )}
            {!upcoming && (
              <ScoreInput
                sessionId={session.id}
                initial={session.score}
                onSaved={onScoreSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
