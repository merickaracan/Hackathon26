import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const mockUser = {
  name: 'Alex Johnson',
  location: 'London, UK',
  university: 'University College London',
  sports: [
    { name: 'Tennis',  skill: 72 },
    { name: 'Padel',   skill: 40 },
  ],
  tags: ['Weekend mornings', 'Competitive', 'Singles'],
}

const notifDefaults = {
  matchRequest:  true,
  matchAccepted: true,
  reminder24h:   true,
  reminder2h:    false,
  newPlayers:    false,
  postExpiring:  true,
}

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
  const [notifs, setNotifs] = useState(notifDefaults)

  const toggle = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    try { await api.patch('/api/users/me/notifications', updated) } catch {}
    showToast('Preferences updated.')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* User card */}
      <div className="bg-white rounded-2xl p-7 border border-border flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-brand-tint text-brand text-2xl font-bold font-display">
            {mockUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-main">{mockUser.name}</h2>
            <p className="text-xs text-text-muted font-body mt-0.5">{mockUser.university}</p>
            <p className="text-xs text-text-muted font-body">📍 {mockUser.location}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-4 font-body">Sports & skill</p>
          <div className="flex flex-col gap-4">
            {mockUser.sports.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1.5 font-body">
                  <span className="font-medium text-text-main">{s.name}</span>
                  <span className="text-text-muted">{s.skill}%</span>
                </div>
                <div className="h-0.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${s.skill}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-3 font-body">Availability</p>
          <div className="flex flex-wrap gap-2">
            {mockUser.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-brand-bg border border-border text-text-muted font-body">{tag}</span>
            ))}
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
