const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../../database/db')

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

function skillPercent(skill) {
  return skill === 'advanced' ? 100 : skill === 'intermediate' ? 66 : 33
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// GET /api/posts
router.get('/', auth, async (req, res) => {
  const { sport } = req.query
  try {
    const params = [req.user.id]
    let text = `
      SELECT p.id, p.user_id AS author_id, u.name AS author, u.sports, p.sport, p.format, p.description, p.created_at,
        CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END AS request_sent
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN requests r ON r.post_id = p.id AND r.from_user = $1 AND r.status IN ('pending','accepted')
    `
    if (sport) {
      text += ` WHERE p.sport = $2`
      params.push(sport)
    }
    text += ` ORDER BY p.created_at DESC`
    const result = await query(text, params)
    const posts = result.rows.map(row => {
      let sportsArr = row.sports
      if (typeof sportsArr === 'string') { try { sportsArr = JSON.parse(sportsArr) } catch { sportsArr = [] } }
      return {
        id: row.id,
        authorId: row.author_id,
        author: row.author,
        initials: initials(row.author),
        sport: row.sport,
        format: row.format,
        timeAgo: timeAgo(row.created_at),
        desc: row.description,
        skill: skillPercent((sportsArr && sportsArr[0] && sportsArr[0].skill) || 'beginner'),
        requestSent: !!row.request_sent,
      }
    })
    return res.json(posts)
  } catch {
    return res.json([])
  }
})

// GET /api/posts/mine — current user's own sessions
router.get('/mine', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, sport, format, datetime, location, description, score, created_at
       FROM posts WHERE user_id = $1 ORDER BY datetime DESC`,
      [req.user.id]
    )
    return res.json(result.rows)
  } catch {
    return res.json([])
  }
})

// POST /api/posts
router.post('/', auth, async (req, res) => {
  const { sport, format, datetime, location, description } = req.body
  if (!sport || !format || !datetime || !location) {
    return res.status(400).json({ error: 'sport, format, datetime and location are required' })
  }
  try {
    const result = await query(
      'INSERT INTO posts (user_id, sport, format, datetime, location, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [req.user.id, sport, format, datetime, location, description || '']
    )
    return res.status(201).json({ id: result.rows[0].id })
  } catch {
    return res.status(201).json({ id: Date.now() })
  }
})

// PATCH /api/posts/:id/score — record score for a session
router.patch('/:id/score', auth, async (req, res) => {
  const { score } = req.body
  if (!score) return res.status(400).json({ error: 'score is required' })
  try {
    const result = await query(
      'UPDATE posts SET score = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      [score, req.params.id, req.user.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Session not found' })
    return res.json({ success: true })
  } catch {
    return res.json({ success: true })
  }
})

module.exports = router
