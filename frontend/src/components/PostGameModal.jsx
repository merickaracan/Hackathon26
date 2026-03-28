import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function PostGameModal({ onClose }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ sport: 'tennis', format: 'singles', datetime: '', location: '', description: '' })
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await api.post('/api/posts', form) } catch {}
    showToast('Session posted.')
    onClose()
  }

  const inputClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body placeholder-text-muted"
  const selectClass = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-text-main bg-white focus:outline-none focus:border-brand font-body"
  const labelClass = "text-[10px] tracking-widest uppercase font-semibold text-text-muted block mb-1.5 font-body"

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-border shadow-xl">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight text-text-main">Post a session</h2>
            <p className="text-xs text-text-muted font-body mt-0.5">Let others know you're looking to play</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-lg leading-none font-body">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className={selectClass}>
                <option value="tennis">Tennis</option>
                <option value="padel">Padel</option>
                <option value="badminton">Badminton</option>
                <option value="squash">Squash</option>
                <option value="running">Running</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Format</label>
              <select name="format" value={form.format} onChange={handleChange} className={selectClass}>
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="mixed doubles">Mixed doubles</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Date & time</label>
            <input type="datetime-local" name="datetime" value={form.datetime} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g. University Sports Centre" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell players about the session..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-border text-text-muted text-sm font-medium hover:border-brand hover:text-brand transition-colors font-body">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors font-body tracking-wide">
              Post session
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
