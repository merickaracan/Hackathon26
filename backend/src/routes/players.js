const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../../database/db')

const MOCK_PLAYERS = [
  { id: 1, name: 'Sarah T.',  sport: 'tennis',    skill: 'intermediate', distance: '0.4 mi', frequency: '2× week', tags: ['Weekend mornings', 'Singles', 'Competitive'] },
  { id: 2, name: 'James M.', sport: 'padel',     skill: 'beginner',     distance: '0.8 mi', frequency: 'Casual',  tags: ['Weekends', 'Friendly games'] },
  { id: 3, name: 'Priya K.', sport: 'football',   skill: 'intermediate', distance: '1.2 mi', frequency: '3× week', tags: ['Weekday evenings', '5-a-side'] },
  { id: 4, name: 'Tom R.',   sport: 'basketball', skill: 'advanced',     distance: '1.8 mi', frequency: '4× week', tags: ['Evenings', 'Competitive'] },
  { id: 5, name: 'Chloe F.', sport: 'running',   skill: 'beginner',     distance: '0.6 mi', frequency: '2× week', tags: ['Early mornings', '5K pace'] },
]

router.get('/nearby', auth, async (req, res) => {
  const { sport } = req.query
  try {
    let text = `SELECT id, name, sports FROM users WHERE id != $1`
    const params = [req.user.id]
    if (sport) {
      text += ` AND sports @> $2::jsonb`
      params.push(JSON.stringify([{ sport }]))
    }
    const result = await query(text, params)
    const players = result.rows.map(u => {
      let sportsArr = u.sports
      if (typeof sportsArr === 'string') { try { sportsArr = JSON.parse(sportsArr) } catch { sportsArr = [] } }
      const primary = (sportsArr && sportsArr[0]) || {}
      return {
        id: u.id,
        name: u.name,
        sport: primary.sport || 'unknown',
        skill: primary.skill || 'beginner',
        distance: '< 1 mi',
        frequency: 'Weekly',
        tags: [primary.skill ? primary.skill.charAt(0).toUpperCase() + primary.skill.slice(1) : 'Beginner'],
      }
    })
    return res.json(players)
  } catch {
    const filtered = sport ? MOCK_PLAYERS.filter(p => p.sport === sport) : MOCK_PLAYERS
    return res.json(filtered)
  }
})

module.exports = router
