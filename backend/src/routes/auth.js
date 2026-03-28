const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/requireAuth')
const { getUserByEmail, getUserById, createUser } = require('../userService')

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

  if (!name)                               return res.status(400).json({ error: 'Name is required' })
  if (!email || !EMAIL_RE.test(email))     return res.status(400).json({ error: 'Valid email is required' })
  if (!password || password.length < 8)   return res.status(400).json({ error: 'Password must be at least 8 characters' })
  if (!sport)                              return res.status(400).json({ error: 'Sport is required' })
  if (!VALID_SKILLS.includes(skill_level)) return res.status(400).json({ error: 'Skill must be beginner, intermediate, or advanced' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const user = await createUser(name, email, hash, sport, skill_level)
    return res.status(201).json({
      token: makeToken(user),
      user: { id: user.id, name: user.name, email: user.email, sports: user.sports },
    })
  } catch (err) {
    const isDuplicate = err.code === '23505' || err.message?.includes('UNIQUE constraint failed')
    if (isDuplicate) return res.status(409).json({ error: 'Email already in use' })
    console.error('Register error:', err.message)
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  try {
    const user = await getUserByEmail(email)
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })

    return res.json({
      token: makeToken(user),
      user: { id: user.id, name: user.name, email: user.email, sports: user.sports },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    return res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json(user)
  } catch (err) {
    console.error('GET /auth/me error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

module.exports = router
