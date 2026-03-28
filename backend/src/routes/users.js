const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../db')

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, sports, availability, university, location,
              notif_match_request, notif_match_accepted, notif_reminder_24h,
              notif_reminder_2h, notif_new_players, notif_post_expiring,
              created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' })
    return res.json(result.rows[0])
  } catch (err) {
    console.error('GET /users/me error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PATCH /api/users/me/notifications
router.patch('/me/notifications', auth, async (req, res) => {
  const { matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring } = req.body
  try {
    await query(
      `UPDATE users SET
         notif_match_request  = $1,
         notif_match_accepted = $2,
         notif_reminder_24h   = $3,
         notif_reminder_2h    = $4,
         notif_new_players    = $5,
         notif_post_expiring  = $6
       WHERE id = $7`,
      [matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring, req.user.id]
    )
    return res.json({ success: true })
  } catch (err) {
    console.error('PATCH /notifications error:', err.message)
    return res.status(500).json({ error: 'Failed to update preferences' })
  }
})

module.exports = router
