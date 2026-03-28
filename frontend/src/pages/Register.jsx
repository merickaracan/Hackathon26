import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', sport: 'tennis', skill: 'beginner' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
    } catch {
      localStorage.setItem('token', 'mock-token')
    }
    navigate('/discover')
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand"
  const selectClass = "w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand"

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F0E0C' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-4xl font-bold">
            <span className="text-brand">Sin</span>
            <span className="text-white">der</span>
          </span>
          <p className="text-gray-400 text-sm mt-2">Find your sports partner</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-xl mb-1">Create an account</h2>
          <p className="text-gray-400 text-sm mb-6">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Full name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className={selectClass}>
                  <option value="tennis">🎾 Tennis</option>
                  <option value="padel">🏓 Padel</option>
                  <option value="badminton">🏸 Badminton</option>
                  <option value="squash">🥎 Squash</option>
                  <option value="running">🏃 Running</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Skill</label>
                <select name="skill" value={form.skill} onChange={handleChange} className={selectClass}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition-colors mt-1">
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
