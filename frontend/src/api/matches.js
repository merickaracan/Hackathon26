const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getMatches = async () => {
  const res = await fetch('/api/matches', { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}
