import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const mockUser = {
  name: 'Alex Johnson',
  location: 'London, UK',
  sports: [
    { name: 'Tennis', skill: 72 },
    { name: 'Padel', skill: 40 },
  ],
  tags: ['Weekend mornings', 'Competitive', 'Singles'],
}

const notifDefaults = {
  matchRequest: true,
  matchAccepted: true,
  reminder24h: true,
  reminder2h: false,
  newPlayers: false,
  postExpiring: true,
}

const notifLabels = {
  matchRequest: 'Match request received',
  matchAccepted: 'Match request accepted',
  reminder24h: 'Game reminder 24h',
  reminder2h: 'Game reminder 2h',
  newPlayers: 'New players near you',
  postExpiring: 'Post expiring soon',
}

export default function Profile() {
  const { showToast } = useToast()
  const [notifs, setNotifs] = useState(notifDefaults)

  const toggle = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    try {
      await api.patch('/api/users/me/notifications', updated)
    } catch {}
    showToast('Preferences saved ✓')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* User card */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
            {mockUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-brand-dark">{mockUser.name}</h2>
            <p className="text-sm text-gray-400">📍 {mockUser.location}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sports & skill</p>
          <div className="flex flex-col gap-3">
            {mockUser.sports.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-brand-dark">{s.name}</span>
                  <span className="text-gray-400">{s.skill}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${s.skill}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</p>
          <div className="flex flex-wrap gap-2">
            {mockUser.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-brand-bg border border-black/5 text-gray-600">{tag}</span>
            ))}
          </div>
        </div>

        <button className="w-full py-2.5 rounded-full border border-brand text-brand text-sm font-medium hover:bg-brand-tint transition-colors">
          Edit profile
        </button>
      </div>

      {/* Notifications card */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h2 className="font-display font-bold text-lg text-brand-dark mb-1">Email notifications</h2>
        <p className="text-sm text-gray-400 mb-6">Choose what you want to be notified about</p>

        <div className="flex flex-col gap-4">
          {Object.entries(notifLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{label}</span>
              <button
                onClick={() => toggle(key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifs[key] ? 'bg-brand' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs[key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
