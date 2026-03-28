const router = require('express').Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

const MOCK_PLAYERS = [
  { id: 1, name: 'Sarah T.',  sport: 'tennis',    skill: 'intermediate', distance: '0.4 mi', frequency: '2× week', tags: ['Weekend mornings', 'Singles', 'Competitive'] },
  { id: 2, name: 'James M.', sport: 'padel',     skill: 'beginner',     distance: '0.8 mi', frequency: 'Casual',  tags: ['Weekends', 'Friendly games'] },
  { id: 3, name: 'Priya K.', sport: 'badminton', skill: 'intermediate', distance: '1.2 mi', frequency: '3× week', tags: ['Weekday mornings', 'Mixed doubles'] },
  { id: 4, name: 'Tom R.',   sport: 'squash',    skill: 'advanced',     distance: '1.8 mi', frequency: '4× week', tags: ['Evenings', 'Competitive'] },
  { id: 5, name: 'Chloe F.', sport: 'running',   skill: 'beginner',     distance: '0.6 mi', frequency: '2× week', tags: ['Early mornings', '5K pace'] },
]

router.get('/nearby', auth, async (req, res) => {
  const { sport } = req.query
  try {
    let text = `SELECT id, name, sport, skill FROM users WHERE id != $1`
    const params = [req.user.id]
    if (sport) {
      text += ` AND sport = $2`
      params.push(sport)
    }
    const result = await query(text, params)
    const players = result.rows.map(u => ({
      id: u.id,
      name: u.name,
      sport: u.sport,
      skill: u.skill,
      distance: '< 1 mi',
      frequency: 'Weekly',
      tags: [u.skill.charAt(0).toUpperCase() + u.skill.slice(1)],
    }))
    return res.json(players)
  } catch {
    const filtered = sport ? MOCK_PLAYERS.filter(p => p.sport === sport) : MOCK_PLAYERS
    return res.json(filtered)
  }
})

module.exports = router
