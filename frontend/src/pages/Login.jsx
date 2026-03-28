import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      navigate('/discover')
    } catch {
      localStorage.setItem('token', 'mock-token')
      navigate('/discover')
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand font-body"

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0C0C0A' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-display text-5xl font-semibold tracking-tight">
            <span className="text-brand">Sin</span>
            <span className="text-white">der</span>
          </span>
          <p className="text-white/30 text-xs mt-3 tracking-widest uppercase font-body">Where campus meets court</p>
        </div>

        <div className="border border-white/8 rounded-2xl p-7 bg-white/3">
          <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-1">Welcome back</h2>
          <p className="text-white/40 text-xs font-body mb-7">Connect with fellow students. Play more. Go further.</p>

          {error && <p className="text-red-400 text-xs mb-4 font-body">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] tracking-widest uppercase font-semibold text-white/30 block mb-1.5 font-body">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@university.edu" required className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] tracking-widest uppercase font-semibold text-white/30 block mb-1.5 font-body">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-brand text-white font-medium text-sm hover:bg-brand/90 transition-colors mt-2 font-body tracking-wide">
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-xs mt-5 font-body">
          New to Sinder?{' '}
          <Link to="/register" className="text-brand hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
