const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getNearbyPlayers = async (sport = '') => {
  const url = sport ? `/api/players/nearby?sport=${encodeURIComponent(sport)}` : '/api/players/nearby'
  const res = await fetch(url, { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json()
}
