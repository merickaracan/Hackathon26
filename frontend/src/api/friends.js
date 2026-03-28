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

export const getFriendStatuses = async () => {
  const res = await fetch('/api/friends/statuses', { headers: authHeader() })
  return throwIfError(res)
}

export const getFriends = async () => {
  const res = await fetch('/api/friends', { headers: authHeader() })
  return throwIfError(res)
}

export const getPendingRequests = async () => {
  const res = await fetch('/api/friends/pending', { headers: authHeader() })
  return throwIfError(res)
}

export const sendFriendRequest = async (toUserId) => {
  const res = await fetch('/api/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ toUserId }),
  })
  return throwIfError(res)
}

export const acceptFriendRequest = async (id) => {
  const res = await fetch(`/api/friends/${id}/accept`, {
    method: 'PATCH',
    headers: authHeader(),
  })
  return throwIfError(res)
}

export const removeFriend = async (id) => {
  const res = await fetch(`/api/friends/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  return throwIfError(res)
}
