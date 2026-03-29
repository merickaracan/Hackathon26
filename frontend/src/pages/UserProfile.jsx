import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '../api/users'

const sportEmoji = {
  tennis: '🎾', padel: '🏓', football: '⚽', basketball: '🏀',
  running: '🏃', cycling: '🚴', swimming: '🏊', golf: '⛳',
}

const sportColors = {
  tennis:     'bg-emerald-100 text-emerald-700',
  padel:      'bg-cyan-100 text-cyan-700',
  football:   'bg-green-100 text-green-700',
  basketball: 'bg-orange-100 text-orange-700',
  running:    'bg-rose-100 text-rose-700',
  cycling:    'bg-lime-100 text-lime-700',
  swimming:   'bg-sky-100 text-sky-700',
  golf:       'bg-teal-100 text-teal-700',
}

const skillColor = {
  beginner:     'bg-sky-50 text-sky-600',
  intermediate: 'bg-amber-50 text-amber-600',
  advanced:     'bg-emerald-50 text-emerald-600',
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatJoined(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getUserProfile(id)
      .then(setProfile)
      .catch(() => setError('Could not load this profile.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-text-muted font-body">Loading…</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-text-muted font-body">{error || 'Profile not found.'}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-brand font-body hover:underline">Go back</button>
      </div>
    )
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const sports = profile.sports || []
  const sessions = profile.recentSessions || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-text-muted font-body hover:text-brand transition-colors"
      >
        ← Back
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-brand to-brand/60" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden bg-brand flex items-center justify-center flex-shrink-0">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                : <span className="text-white text-xl font-bold font-display">{initials}</span>
              }
            </div>
          </div>

          <h1 className="font-display text-xl font-semibold tracking-tight text-text-main">{profile.name}</h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {profile.university && (
              <span className="text-xs text-text-muted font-body">🎓 {profile.university}</span>
            )}
            {profile.location && (
              <span className="text-xs text-text-muted font-body">📍 {profile.location}</span>
            )}
            {profile.created_at && (
              <span className="text-xs text-text-muted font-body">🗓 Member since {formatJoined(profile.created_at)}</span>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-body flex items-center gap-1 text-pink-500 hover:text-pink-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{profile.instagram}
              </a>
            )}
          </div>

          {sports.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {sports.map((s, i) => (
                <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full font-body capitalize ${sportColors[s.sport] || 'bg-brand-tint text-brand'}`}>
                  {sportEmoji[s.sport] || '🏅'} {s.sport}
                  {s.skill && (
                    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${skillColor[s.skill] || 'bg-border text-text-muted'}`}>
                      {s.skill}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-5 font-body">
          Recent sessions
        </p>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm text-text-muted font-body">No past sessions yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {sessions.map(s => (
              <div key={s.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${sportColors[s.sport] ? sportColors[s.sport].replace('text-', 'bg-').split(' ')[0] : 'bg-border/50'}`}>
                    {sportEmoji[s.sport] || '🏅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-main capitalize font-body">{s.sport}</span>
                      <span className="text-[10px] bg-border/60 text-text-muted px-2 py-0.5 rounded-full font-body">{s.format}</span>
                    </div>
                    <p className="text-xs text-text-muted font-body mt-0.5">
                      📍 {s.location} · {formatDate(s.datetime)}
                    </p>
                    {s.description && (
                      <p className="text-xs text-text-muted font-body mt-1 italic line-clamp-1">"{s.description}"</p>
                    )}
                    {s.score && (
                      <p className="text-xs font-body mt-1">
                        <span className="text-text-muted">Score: </span>
                        <span className="font-semibold text-text-main">{s.score}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
