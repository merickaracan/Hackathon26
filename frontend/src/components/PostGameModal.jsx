import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function PostGameModal({ onClose }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    sport: 'tennis', format: 'singles', datetime: '', location: '', description: '',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/posts', form)
    } catch {}
    showToast('Game posted! 🎉')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-brand-dark">Post a game</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="tennis">🎾 Tennis</option>
                <option value="padel">🏓 Padel</option>
                <option value="badminton">🏸 Badminton</option>
                <option value="squash">🥎 Squash</option>
                <option value="running">🏃 Running</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Format</label>
              <select name="format" value={form.format} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand">
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="mixed doubles">Mixed doubles</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date & time</label>
            <input type="datetime-local" name="datetime" value={form.datetime} onChange={handleChange} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Regent's Park courts" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell players about the game..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-400 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              Post game
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
