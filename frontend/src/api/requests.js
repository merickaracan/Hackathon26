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

// All direct relationships for the current user { relationships: [...] }
export const getRelationships = async () => {
  const res = await fetch('/api/requests', { headers: authHeader() })
  return throwIfError(res)
}

// Batch statuses for Discover page: { [otherUserId]: { id, status, direction } }
export const getRelationshipStatuses = async () => {
  const res = await fetch('/api/requests/statuses', { headers: authHeader() })
  if (!res.ok) return {}
  return res.json()
}

// Single relationship status with one player
export const getRelationshipStatus = async (otherUserId) => {
  const res = await fetch(`/api/requests/status/${otherUserId}`, { headers: authHeader() })
  return throwIfError(res)
}

// Send a direct match request to a player, or a session join request to a post
export const sendRequest = async ({ playerId, postId }) => {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(playerId ? { playerId } : { postId }),
  })
  return throwIfError(res)
}

// Recipient accepts a pending request
export const acceptRequest = async (id) => {
  const res = await fetch(`/api/requests/${id}/accept`, {
    method: 'PATCH',
    headers: authHeader(),
  })
  return throwIfError(res)
}

// Recipient declines — deletes the row so sender can re-request later
export const declineRequest = async (id) => {
  const res = await fetch(`/api/requests/${id}/decline`, {
    method: 'PATCH',
    headers: authHeader(),
  })
  return throwIfError(res)
}

// Either party unmatches by the OTHER user's ID — deletes the row entirely
export const unmatch = async (otherUserId) => {
  const res = await fetch(`/api/requests/unmatch/${otherUserId}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  return throwIfError(res)
}

// Sender cancels a pending request, or either party removes a connection by row ID
export const removeConnection = async (id) => {
  const res = await fetch(`/api/requests/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  return throwIfError(res)
}

// Legacy: get sent post-request IDs for Posts page
export const getSentPostRequests = async () => {
  try {
    const map = await getRelationshipStatuses()
    return { postIds: [] } // post requests tracked separately via session accept flow
  } catch {
    return { postIds: [] }
  }
}
