const router = require('express').Router()
const auth   = require('../middleware/requireAuth')
const { query } = require('../../database/db')

const VALID_SKILLS = ['beginner', 'intermediate', 'advanced']

// GET /api/ratings/players
// Returns all players the current user has an accepted connection with (eligible to rate)
router.get('/players', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT DISTINCT
         u.id, u.name, u.sports,
         r.id AS request_id
       FROM requests r
       JOIN users u ON (
         CASE WHEN r.from_user = $1 THEN r.to_user ELSE r.from_user END = u.id
       )
       WHERE (r.from_user = $1 OR r.to_user = $1)
         AND r.status = 'accepted'
       ORDER BY u.name`,
      [req.user.id]
    )
    // Parse sports JSON if stored as string (SQLite)
    const players = rows.map(p => ({
      ...p,
      sports: typeof p.sports === 'string' ? JSON.parse(p.sports) : (p.sports || []),
    }))
    return res.json({ players })
  } catch (err) {
    console.error('GET /ratings/players error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/ratings/given
// Ratings the current user has submitted
router.get('/given', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.name AS to_name
       FROM ratings r
       JOIN users u ON r.to_user = u.id
       WHERE r.from_user = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    )
    return res.json({ ratings: rows })
  } catch (err) {
    console.error('GET /ratings/given error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/ratings/received
// Ratings the current user has received
router.get('/received', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT r.*, u.name AS from_name
       FROM ratings r
       JOIN users u ON r.from_user = u.id
       WHERE r.to_user = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    )
    return res.json({ ratings: rows })
  } catch (err) {
    console.error('GET /ratings/received error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/ratings
// Submit or update a rating for a player on a specific sport
router.post('/', auth, async (req, res) => {
  const { toUserId, sport, actualSkill, comment = '' } = req.body

  if (!toUserId || !sport || !actualSkill) {
    return res.status(400).json({ error: 'toUserId, sport and actualSkill are required' })
  }
  if (!VALID_SKILLS.includes(actualSkill)) {
    return res.status(400).json({ error: 'actualSkill must be beginner, intermediate or advanced' })
  }
  if (Number(toUserId) === Number(req.user.id)) {
    return res.status(400).json({ error: 'You cannot rate yourself' })
  }

  try {
    // Verify they have an accepted connection
    const { rows: rel } = await query(
      `SELECT id FROM requests
       WHERE ((from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1))
         AND status = 'accepted'
       LIMIT 1`,
      [req.user.id, toUserId]
    )
    if (!rel[0]) {
      return res.status(403).json({ error: 'You can only rate players you have connected with' })
    }

    // Upsert — update if already rated this person for this sport
    await query(
      `INSERT INTO ratings (from_user, to_user, sport, actual_skill, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(from_user, to_user, sport)
       DO UPDATE SET actual_skill = $4, comment = $5, created_at = CURRENT_TIMESTAMP`,
      [req.user.id, toUserId, sport, actualSkill, comment]
    )
    return res.status(201).json({ success: true })
  } catch (err) {
    console.error('POST /ratings error:', err.message)
    return res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
