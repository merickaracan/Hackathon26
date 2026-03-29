const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const throwIfError = async (res) => {
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed')
    err.response = { data, status: res.status }
    throw err
  }
  return data
}

export const getMe = async () => {
  const res = await fetch('/api/users/me', { headers: authHeader() })
  return throwIfError(res)
}

export const updateProfile = async (updates) => {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(updates),
  })
  return throwIfError(res)
}

export const getUserProfile = async (id) => {
  const res = await fetch(`/api/users/${id}`, { headers: authHeader() })
  return throwIfError(res)
}

export const updateNotifications = async (prefs) => {
  const res = await fetch('/api/users/me/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(prefs),
  })
  if (!res.ok) throw new Error('Failed to update notifications')
  return res.json()
}
