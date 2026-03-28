const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../db')

const MOCK_POSTS = [
  { id: 1, author: 'Alex L.',  initials: 'AL', sport: 'tennis',    format: 'Singles',       timeAgo: '20 min ago', desc: 'Looking for a hitting partner this Sunday at 9am. Around 3.5–4.0 level.', skill: 68 },
  { id: 2, author: 'Maya T.', initials: 'MT', sport: 'padel',     format: 'Mixed doubles', timeAgo: '1 hr ago',   desc: 'Beginner padel player looking for a relaxed partner — any level welcome.', skill: 22 },
  { id: 3, author: 'Ravi B.', initials: 'RB', sport: 'badminton', format: 'Doubles',        timeAgo: '3 hrs ago',  desc: 'Got a doubles court booked at the Sports Centre on Saturday afternoon — need one more player.', skill: 48 },
]

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
    let text = `
      SELECT p.id, u.name AS author, u.sports, p.sport, p.format, p.description, p.created_at
      FROM posts p
      JOIN users u ON u.id = p.user_id
    `
    const params = []
    if (sport) {
      text += ` WHERE p.sport = $1`
      params.push(sport)
    }
    text += ` ORDER BY p.created_at DESC`
    const result = await query(text, params)
    const posts = result.rows.map(row => ({
      id: row.id,
      author: row.author,
      initials: initials(row.author),
      sport: row.sport,
      format: row.format,
      timeAgo: timeAgo(row.created_at),
      desc: row.description,
      skill: skillPercent((row.sports && row.sports[0] && row.sports[0].skill) || 'beginner'),
    }))
    return res.json(posts)
  } catch {
    const filtered = sport ? MOCK_POSTS.filter(p => p.sport === sport) : MOCK_POSTS
    return res.json(filtered)
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

module.exports = router
