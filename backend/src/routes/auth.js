const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { query } = require('../db')
const auth = require('../middleware/requireAuth')

const VALID_SKILLS = ['beginner', 'intermediate', 'advanced']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, sport, skill_level } = req.body

  if (!name)                          return res.status(400).json({ error: 'Name is required' })
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Valid email is required' })
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (!sport)                         return res.status(400).json({ error: 'Sport is required' })
  if (!VALID_SKILLS.includes(skill_level)) return res.status(400).json({ error: 'Skill must be beginner, intermediate, or advanced' })

  const sports = [{ sport, skill: skill_level }]

  try {
    const hash = await bcrypt.hash(password, 10)
    const result = await query(
      `INSERT INTO users (name, email, password, sports)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, sports, created_at`,
      [name, email, hash, JSON.stringify(sports)]
    )
    const user = result.rows[0]
    return res.status(201).json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email, sports: user.sports } })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' })
    console.error('Register error:', err.message)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })

    return res.json({
      token: makeToken(user),
      user: { id: user.id, name: user.name, email: user.email, sports: user.sports }
    })
  } catch (err) {
    console.error('Login error:', err.message)
    return res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, sports, availability,
              notif_match_request, notif_match_accepted, notif_reminder_24h,
              created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('GET /me error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

module.exports = router
