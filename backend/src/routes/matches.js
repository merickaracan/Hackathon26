const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../db')

const MOCK = {
  confirmed: [
    { id: 1, name: 'Sarah T.', detail: 'Tennis · 0.4 mi away',    sport: 'tennis'    },
    { id: 2, name: 'Priya K.', detail: 'Badminton · 1.2 mi away', sport: 'badminton' },
  ],
  pending: [
    { id: 3, name: 'Tom R.', detail: 'Squash · Sent 2 hrs ago', sport: 'squash' },
  ],
}

router.get('/', auth, async (req, res) => {
  try {
    const confirmedQ = await query(
      `SELECT r.id, u.name, u.sport
       FROM requests r
       JOIN users u ON u.id = CASE WHEN r.from_user = $1 THEN r.to_user ELSE r.from_user END
       WHERE (r.from_user = $1 OR r.to_user = $1) AND r.status = 'accepted'`,
      [req.user.id]
    )
    const pendingQ = await query(
      `SELECT r.id, u.name, u.sport, r.created_at
       FROM requests r
       JOIN users u ON u.id = r.to_user
       WHERE r.from_user = $1 AND r.status = 'pending'`,
      [req.user.id]
    )

    function timeAgo(date) {
      const diff = Math.floor((Date.now() - new Date(date)) / 1000)
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
      if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
      return `${Math.floor(diff / 86400)} days ago`
    }

    return res.json({
      confirmed: confirmedQ.rows.map(r => ({
        id: r.id, name: r.name, sport: r.sport, detail: `${r.sport} · nearby`,
      })),
      pending: pendingQ.rows.map(r => ({
        id: r.id, name: r.name, sport: r.sport, detail: `${r.sport} · Sent ${timeAgo(r.created_at)}`,
      })),
    })
  } catch {
    return res.json(MOCK)
  }
})

module.exports = router
