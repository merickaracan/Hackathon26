const router = require('express').Router()
const auth   = require('../middleware/requireAuth')
const rel    = require('../db/relationships')
const { query } = require('../../database/db')

// ─── Direct match-request endpoints ────────────────────────────────────────

// GET /api/requests
// All direct relationships for the current user (pending + accepted, both directions)
router.get('/', auth, async (req, res) => {
  try {
    const relationships = await rel.getUserRelationships(req.user.id)
    return res.json({ relationships })
  } catch (err) {
    console.error('GET /requests error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/requests/statuses
// Map of { [otherUserId]: { id, status, direction } } — used to initialise Discover cards
router.get('/statuses', auth, async (req, res) => {
  try {
    const map = await rel.getRelationshipStatuses(req.user.id)
    return res.json(map)
  } catch (err) {
    console.error('GET /requests/statuses error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/requests/status/:otherUserId
// Single relationship status with one other user
router.get('/status/:otherUserId', auth, async (req, res) => {
  try {
    const relationship = await rel.getRelationship(req.user.id, req.params.otherUserId)
    return res.json({ relationship: relationship || null })
  } catch (err) {
    console.error('GET /requests/status error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/requests
// Send a direct match request  { playerId }
// OR a session join request    { postId }
router.post('/', auth, async (req, res) => {
  const { playerId, postId } = req.body

  if (!playerId && !postId) {
    return res.status(400).json({ error: 'playerId or postId is required' })
  }

  try {
    if (playerId) {
      if (Number(playerId) === Number(req.user.id)) {
        return res.status(400).json({ error: 'You cannot send a request to yourself' })
      }
      const request = await rel.sendMatchRequest(req.user.id, playerId)
      return res.status(201).json({ success: true, request })
    }

    // Session join request (tied to a post)
    const { rows: post } = await query('SELECT user_id FROM posts WHERE id = $1', [postId])
    if (!post[0]) return res.status(404).json({ error: 'Post not found' })

    const toUser = post[0].user_id
    if (Number(req.user.id) === Number(toUser)) {
      return res.status(400).json({ error: 'You cannot send a request on your own session' })
    }
    const { rows: existing } = await query(
      `SELECT id FROM requests WHERE from_user = $1 AND to_user = $2 AND post_id = $3`,
      [req.user.id, toUser, postId]
    )
    if (existing.length > 0) return res.status(409).json({ error: 'Request already sent' })

    await query(
      `INSERT INTO requests (from_user, to_user, post_id, status) VALUES ($1,$2,$3,'pending')`,
      [req.user.id, toUser, postId]
    )
    return res.status(201).json({ success: true })

  } catch (err) {
    if (err.message === 'SELF_REQUEST') {
      return res.status(400).json({ error: 'You cannot send a request to yourself' })
    }
    if (err.message === 'ALREADY_EXISTS') {
      return res.status(409).json({ error: 'A request or match already exists with this player' })
    }
    console.error('POST /requests error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/requests/:id/accept
// Recipient accepts — works for both direct and session requests
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    // Try as a direct match request first
    await rel.acceptMatchRequest(req.params.id, req.user.id)
    return res.json({ success: true })
  } catch (e) {
    if (e.message !== 'REQUEST_NOT_FOUND') {
      console.error('PATCH accept error:', e.message)
      return res.status(500).json({ error: 'Server error' })
    }
    // Fall through to session-join accept
    try {
      const { rows } = await query(
        `UPDATE requests SET status = 'accepted'
         WHERE id = $1 AND to_user = $2 AND status = 'pending'
         RETURNING id`,
        [req.params.id, req.user.id]
      )
      if (!rows[0]) return res.status(404).json({ error: 'Request not found' })
      return res.json({ success: true })
    } catch (err) {
      console.error('PATCH accept (session) error:', err.message)
      return res.status(500).json({ error: 'Server error' })
    }
  }
})

// PATCH /api/requests/:id/decline
// Recipient declines — deletes the row so the sender can re-request later
router.patch('/:id/decline', auth, async (req, res) => {
  try {
    await rel.declineMatchRequest(req.params.id, req.user.id)
    return res.json({ success: true })
  } catch (e) {
    if (e.message !== 'REQUEST_NOT_FOUND') {
      console.error('PATCH decline error:', e.message)
      return res.status(500).json({ error: 'Server error' })
    }
    // Fall through to session-join decline
    try {
      await query(
        `DELETE FROM requests WHERE id = $1 AND to_user = $2`,
        [req.params.id, req.user.id]
      )
      return res.json({ success: true })
    } catch (err) {
      console.error('PATCH decline (session) error:', err.message)
      return res.status(500).json({ error: 'Server error' })
    }
  }
})

// DELETE /api/requests/unmatch/:otherUserId
// Either party unmatches — deletes the accepted relationship so re-requesting is allowed
router.delete('/unmatch/:otherUserId', auth, async (req, res) => {
  try {
    await rel.unmatch(req.user.id, req.params.otherUserId)
    return res.json({ success: true })
  } catch (err) {
    if (err.message === 'MATCH_NOT_FOUND') {
      return res.status(404).json({ error: 'No active match found' })
    }
    console.error('DELETE /unmatch error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/requests/:id
// Sender cancels a pending request OR either party removes a connection by row ID
router.delete('/:id', auth, async (req, res) => {
  try {
    // Try to cancel as sender first
    await rel.cancelMatchRequest(req.params.id, req.user.id)
    return res.json({ success: true })
  } catch (e) {
    if (e.message !== 'REQUEST_NOT_FOUND') {
      console.error('DELETE /requests/:id error:', e.message)
      return res.status(500).json({ error: 'Server error' })
    }
    // Fallback: either party deletes any request type by ID
    try {
      await query(
        `DELETE FROM requests WHERE id = $1 AND (from_user = $2 OR to_user = $2)`,
        [req.params.id, req.user.id]
      )
      return res.json({ success: true })
    } catch (err) {
      console.error('DELETE /requests/:id fallback error:', err.message)
      return res.status(500).json({ error: 'Server error' })
    }
  }
})

module.exports = router
