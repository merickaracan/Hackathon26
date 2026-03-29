const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getPosts = async (sport = '') => {
  const url = sport ? `/api/posts?sport=${encodeURIComponent(sport)}` : '/api/posts'
  const res = await fetch(url, { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export const getCompletedSessions = async () => {
  const res = await fetch('/api/posts/completed', { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch completed sessions')
  return res.json()
}

export const getMyPosts = async () => {
  const res = await fetch('/api/posts/mine', { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export const createPost = async (body) => {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to create post')
    err.response = { data }
    throw err
  }
  return data
}

export const updateScore = async (sessionId, score) => {
  const res = await fetch(`/api/posts/${sessionId}/score`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ score }),
  })
  if (!res.ok) throw new Error('Failed to update score')
  return res.json()
}
