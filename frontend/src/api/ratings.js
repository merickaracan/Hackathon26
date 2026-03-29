const BASE = '/api/ratings'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const throwIfError = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const getRatablePlayers = () =>
  fetch(`${BASE}/players`, { headers: authHeaders() }).then(throwIfError)

export const submitRating = (toUserId, sport, actualSkill, comment = '') =>
  fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ toUserId, sport, actualSkill, comment }),
  }).then(throwIfError)

export const getGivenRatings = () =>
  fetch(`${BASE}/given`, { headers: authHeaders() }).then(throwIfError)

export const getReceivedRatings = () =>
  fetch(`${BASE}/received`, { headers: authHeaders() }).then(throwIfError)
