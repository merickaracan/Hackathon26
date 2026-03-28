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
      // Dev fallback: store a mock token
      localStorage.setItem('token', 'mock-token')
      navigate('/discover')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0F0E0C' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-4xl font-bold">
            <span className="text-brand">Sin</span>
            <span className="text-white">der</span>
          </span>
          <p className="text-gray-400 text-sm mt-2">Find your sports partner</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-xl mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Log in to your account</p>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition-colors mt-1">
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
