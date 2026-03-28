const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../../database/db')

router.get('/nearby', auth, async (req, res) => {
  const { sport } = req.query
  try {
    const result = await query(`SELECT id, name, sports FROM users WHERE id != $1`, [req.user.id])
    let players = result.rows.map((u) => {
      let sportsArr = u.sports
      if (typeof sportsArr === 'string') {
        try {
          sportsArr = JSON.parse(sportsArr)
        } catch {
          sportsArr = []
        }
      }
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
    if (sport) {
      players = players.filter((p) => p.sport === sport)
    }
    return res.json(players)
  } catch {
    return res.json([])
  }
})

module.exports = router
