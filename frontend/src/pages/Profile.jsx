import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const skillPercent = { beginner: 33, intermediate: 66, advanced: 100 }

const notifLabels = {
  matchRequest:  'Match request received',
  matchAccepted: 'Match request accepted',
  reminder24h:   'Session reminder (24h)',
  reminder2h:    'Session reminder (2h)',
  newPlayers:    'New players near you',
  postExpiring:  'Post expiring soon',
}

export default function Profile() {
  const { showToast } = useToast()
  const { user, profile } = useAuth()
  const [notifs, setNotifs] = useState(null)

  // Load notification prefs from the API once profile is available
  useEffect(() => {
    if (!profile) return
    setNotifs({
      matchRequest:  profile.notif_match_request  ?? true,
      matchAccepted: profile.notif_match_accepted ?? true,
      reminder24h:   profile.notif_reminder_24h   ?? true,
      reminder2h:    profile.notif_reminder_2h    ?? false,
      newPlayers:    profile.notif_new_players     ?? false,
      postExpiring:  profile.notif_post_expiring   ?? true,
    })
  }, [profile])

  const toggle = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    try { await api.patch('/api/users/me/notifications', updated) } catch {}
    showToast('Preferences updated.')
  }

  // Derive display values — sports is a JSONB array [{ sport, skill }]
  const name     = profile?.name  || user?.name  || '—'
  const uni      = profile?.university || '—'
  const location = profile?.location   || null
  const sports   = profile?.sports     || []
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* User card */}
      <div className="bg-white rounded-2xl p-7 border border-border flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-brand-tint text-brand text-2xl font-bold font-display">
            {initials}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-main">{name}</h2>
            {uni !== '—' && <p className="text-xs text-text-muted font-body mt-0.5">{uni}</p>}
            {location && <p className="text-xs text-text-muted font-body">📍 {location}</p>}
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-4 font-body">
            Sport & skill
          </p>
          {sports.length > 0 ? (
            <div className="flex flex-col gap-4">
              {sports.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5 font-body">
                    <span className="font-medium text-text-main capitalize">{s.sport}</span>
                    <span className="text-text-muted capitalize">{s.skill}</span>
                  </div>
                  <div className="h-0.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${skillPercent[s.skill] || 33}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted font-body">No sports added yet.</p>
          )}
        </div>

        <button className="w-full py-2.5 rounded-full border border-brand text-brand text-sm font-medium hover:bg-brand-tint transition-colors font-body tracking-wide">
          Edit profile
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-7 border border-border">
        <h2 className="font-display text-xl font-semibold tracking-tight text-text-main mb-1">
          Email notifications
        </h2>
        <p className="text-xs text-text-muted font-body mb-7">
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
    </div>
  )
}
