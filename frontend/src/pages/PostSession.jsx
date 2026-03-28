import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { createPost } from '../api/posts'

const SPORTS = [
  { value: 'tennis',    label: '🎾 Tennis' },
  { value: 'padel',     label: '🏓 Padel' },
  { value: 'football',   label: '⚽ Football' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'running',   label: '🏃 Running' },
  { value: 'cycling',   label: '🚴 Cycling' },
  { value: 'swimming',  label: '🏊 Swimming' },
  { value: 'golf',      label: '⛳ Golf' },
]

const FORMATS = [
  { value: 'singles',       label: 'Singles' },
  { value: 'doubles',       label: 'Doubles' },
  { value: 'mixed doubles', label: 'Mixed doubles' },
  { value: 'group',         label: 'Group / open' },
]

const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body placeholder-text-muted transition-colors"
const selectClass = "w-full border border-border rounded-xl px-4 py-3 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body transition-colors"
const labelClass = "text-[10px] tracking-widest uppercase font-semibold text-text-muted block mb-1.5 font-body"

export default function PostSession() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    sport: 'tennis',
    format: 'singles',
    datetime: '',
    location: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.datetime) { setError('Please pick a date and time.'); return }
    if (!form.location.trim()) { setError('Location is required.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await createPost(form)
      showToast('Session posted!')
      navigate('/posts')
    } catch {
      setError('Failed to post session. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-main">Post a session</h1>
        <p className="text-sm text-text-muted font-body mt-1">Let other players near you know you're looking to play.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">

        {/* Sport + Format */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sport</label>
            <select name="sport" value={form.sport} onChange={handleChange} className={selectClass}>
              {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Format</label>
            <select name="format" value={form.format} onChange={handleChange} className={selectClass}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {/* Date & time */}
        <div>
          <label className={labelClass}>Date &amp; time</label>
          <input
            type="datetime-local"
            name="datetime"
            value={form.datetime}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. University Sports Centre, Court 3"
            required
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description <span className="normal-case tracking-normal text-text-muted/60">(optional)</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Tell players about the session — skill level, what to expect, any equipment needed..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-red-500 font-body">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-full border border-border text-text-muted text-sm font-medium hover:border-brand hover:text-brand transition-colors font-body"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-colors font-body tracking-wide disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post session'}
          </button>
        </div>
      </form>
    </div>
  )
}
