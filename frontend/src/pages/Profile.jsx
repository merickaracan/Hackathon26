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

const notifDefaults = {
  matchRequest: true, matchAccepted: true, reminder24h: true,
  reminder2h: false, newPlayers: false, postExpiring: true,
}

export default function Profile() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [notifs, setNotifs] = useState(notifDefaults)

  useEffect(() => {
    api.get('/api/users/me')
      .then(res => setProfile(res.data))
      .catch(() => setProfile(user))
  }, [user?.id])

  const toggle = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    try { await api.patch('/api/users/me/notifications', updated) } catch {}
    showToast('Preferences updated.')
  }

  const name     = profile?.name     || user?.name     || '—'
  const sport    = profile?.sport    || user?.sport    || '—'
  const skill    = profile?.skill    || user?.skill    || 'beginner'
  const uni      = profile?.university || 'University'
  const location = profile?.location  || '—'
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
            <p className="text-xs text-text-muted font-body mt-0.5">{uni}</p>
            {location !== '—' && <p className="text-xs text-text-muted font-body">📍 {location}</p>}
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-4 font-body">Sport & skill</p>
          <div>
            <div className="flex justify-between text-sm mb-1.5 font-body">
              <span className="font-medium text-text-main capitalize">{sport}</span>
              <span className="text-text-muted capitalize">{skill}</span>
            </div>
            <div className="h-0.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: `${skillPercent[skill] || 33}%` }} />
            </div>
          </div>
        </div>

        <button className="w-full py-2.5 rounded-full border border-brand text-brand text-sm font-medium hover:bg-brand-tint transition-colors font-body tracking-wide">
          Edit profile
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-7 border border-border">
        <h2 className="font-display text-xl font-semibold tracking-tight text-text-main mb-1">Email notifications</h2>
        <p className="text-xs text-text-muted font-body mb-7">Choose what you want to be notified about</p>

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
      </div>
    </div>
  )
}
