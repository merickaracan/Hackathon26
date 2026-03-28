const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../../database/db')

function parseSports(raw) {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
  return Array.isArray(raw) ? raw : []
}

// GET /api/friends/statuses — map of userId → 'pending_sent'|'pending_received'|'accepted'
router.get('/statuses', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT from_user, to_user, status FROM friendships
       WHERE from_user = $1 OR to_user = $1`,
      [req.user.id]
    )
    const uid = Number(req.user.id)
    const map = {}
    for (const r of rows) {
      const otherId = Number(r.from_user) === uid ? r.to_user : r.from_user
      if (r.status === 'accepted') map[otherId] = 'accepted'
      else if (Number(r.from_user) === uid) map[otherId] = 'pending_sent'
      else map[otherId] = 'pending_received'
    }
    return res.json(map)
  } catch (err) {
    console.error('GET /friends/statuses error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch statuses' })
  }
})

// GET /api/friends — accepted friends (stored permanently until removed)
router.get('/', auth, async (req, res) => {
  try {
    // Friends where I sent the request
    const sentQ = await query(
      `SELECT f.id, u.id AS friend_id, u.name, u.sports
       FROM friendships f
       JOIN users u ON u.id = f.to_user
       WHERE f.from_user = $1 AND f.status = 'accepted'
       ORDER BY u.name`,
      [req.user.id]
    )
    // Friends where they sent the request
    const receivedQ = await query(
      `SELECT f.id, u.id AS friend_id, u.name, u.sports
       FROM friendships f
       JOIN users u ON u.id = f.from_user
       WHERE f.to_user = $1 AND f.status = 'accepted'
       ORDER BY u.name`,
      [req.user.id]
    )
    const toFriend = r => {
      const sports = parseSports(r.sports)
      return { id: r.id, friendId: r.friend_id, name: r.name, sport: sports[0]?.sport || null, skill: sports[0]?.skill || null }
    }
    return res.json([...sentQ.rows.map(toFriend), ...receivedQ.rows.map(toFriend)])
  } catch (err) {
    console.error('GET /friends error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch friends' })
  }
})

// GET /api/friends/pending — incoming requests waiting on me
router.get('/pending', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT f.id, f.created_at, u.id AS sender_id, u.name, u.sports
       FROM friendships f
       JOIN users u ON u.id = f.from_user
       WHERE f.to_user = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.user.id]
    )
    return res.json(rows.map(r => {
      const sports = parseSports(r.sports)
      return { id: r.id, senderId: r.sender_id, name: r.name, sport: sports[0]?.sport || null, skill: sports[0]?.skill || null }
    }))
  } catch (err) {
    console.error('GET /friends/pending error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch pending requests' })
  }
})

// POST /api/friends — send a friend request
router.post('/', auth, async (req, res) => {
  const { toUserId } = req.body
  if (!toUserId) return res.status(400).json({ error: 'toUserId is required' })
  if (Number(toUserId) === Number(req.user.id)) return res.status(400).json({ error: 'Cannot add yourself' })
  try {
    const { rows: existing } = await query(
      `SELECT id, status FROM friendships
       WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)`,
      [req.user.id, toUserId]
    )
    if (existing.length > 0) {
      if (existing[0].status === 'accepted') return res.status(409).json({ error: 'Already friends' })
      return res.status(409).json({ error: 'Friend request already sent' })
    }
    await query(
      'INSERT INTO friendships (from_user, to_user, status) VALUES ($1, $2, $3)',
      [req.user.id, toUserId, 'pending']
    )
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error('POST /friends error:', err.message)
    return res.status(500).json({ error: 'Failed to send friend request' })
  }
})

// PATCH /api/friends/:id/accept
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE friendships SET status = 'accepted'
       WHERE id = $1 AND to_user = $2 AND status = 'pending'
       RETURNING id`,
      [req.params.id, req.user.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Request not found' })
    return res.json({ success: true })
  } catch (err) {
    console.error('PATCH /friends/:id/accept error:', err.message)
    return res.status(500).json({ error: 'Failed to accept request' })
  }
})

// DELETE /api/friends/:id — unfriend or decline
router.delete('/:id', auth, async (req, res) => {
  try {
    await query(
      `DELETE FROM friendships
       WHERE id = $1 AND (from_user = $2 OR to_user = $2)`,
      [req.params.id, req.user.id]
    )
    return res.json({ success: true })
  } catch (err) {
    console.error('DELETE /friends/:id error:', err.message)
    return res.status(500).json({ error: 'Failed to remove friendship' })
  }
})

module.exports = router
