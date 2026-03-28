import { useState } from 'react'
import { updateProfile } from '../api/users'

const SPORTS_OPTIONS = [
  { value: 'tennis',    label: '🎾 Tennis' },
  { value: 'padel',     label: '🏓 Padel' },
  { value: 'football',   label: '⚽ Football' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'running',   label: '🏃 Running' },
  { value: 'cycling',   label: '🚴 Cycling' },
  { value: 'swimming',  label: '🏊 Swimming' },
  { value: 'golf',      label: '⛳ Golf' },
]

const SKILL_OPTIONS = ['beginner', 'intermediate', 'advanced']

const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body placeholder-text-muted"
const labelClass = "text-[10px] tracking-widest uppercase font-semibold text-text-muted block mb-1.5 font-body"
const selectClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body"

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:       profile?.name       || '',
    university: profile?.university || '',
    location:   profile?.location   || '',
  })
  const [sports, setSports] = useState(
    profile?.sports?.length > 0
      ? profile.sports.map(s => ({ sport: s.sport, skill: s.skill }))
      : [{ sport: 'tennis', skill: 'beginner' }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const updateSport = (i, field, value) => {
    setSports(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const addSport = () => {
    if (sports.length >= 4) return
    setSports(prev => [...prev, { sport: 'tennis', skill: 'beginner' }])
  }

  const removeSport = (i) => {
    if (sports.length <= 1) return
    setSports(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateProfile({ ...form, sports })
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Edit profile</h2>
            <p className="text-xs text-text-muted font-body mt-0.5">Update your info and sports</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-lg leading-none font-body">✕</button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">

          <div>
            <label className={labelClass}>Full name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Jamie Davies" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>University</label>
            <input name="university" value={form.university} onChange={handleChange} placeholder="e.g. University of Bristol" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bristol, UK" className={inputClass} />
          </div>

          {/* Sports */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass} style={{ marginBottom: 0 }}>Sports &amp; skills</label>
              {sports.length < 4 && (
                <button type="button" onClick={addSport} className="text-[11px] text-brand font-body font-medium hover:underline">
                  + Add sport
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {sports.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={s.sport} onChange={e => updateSport(i, 'sport', e.target.value)} className={selectClass}>
                    {SPORTS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={s.skill} onChange={e => updateSport(i, 'skill', e.target.value)} className={selectClass} style={{ maxWidth: 140 }}>
                    {SKILL_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                  {sports.length > 1 && (
                    <button type="button" onClick={() => removeSport(i)} className="text-text-muted hover:text-red-400 text-sm flex-shrink-0 font-body">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-body">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-text-muted text-sm font-medium hover:border-brand hover:text-brand transition-colors font-body">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors font-body tracking-wide disabled:opacity-60">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
