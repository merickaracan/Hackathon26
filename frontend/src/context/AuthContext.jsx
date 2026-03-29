import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { getMe } from '../api/users'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    return token ? decodeToken(token) : null
  })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user?.id) { setProfile(null); return }
    getMe()
      .then(data => setProfile(data))
      .catch((err) => {
        if (err.response) {
          localStorage.removeItem('token')
          setUser(null)
          setProfile(null)
        }
      })
  }, [user?.id])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    localStorage.setItem('token', data.token)
    setUser(decodeToken(data.token))
  }

  const register = async (name, email, password) => {
    const data = await apiRegister(name, email, password)
    localStorage.setItem('token', data.token)
    setUser(decodeToken(data.token))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, profile, setProfile, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
