const router = require('express').Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

// PATCH /api/users/me/notifications
router.patch('/me/notifications', auth, async (req, res) => {
  const { matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring } = req.body
  try {
    await query(
      `INSERT INTO notification_prefs (user_id, match_request, match_accepted, reminder_24h, reminder_2h, new_players, post_expiring)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET
         match_request  = EXCLUDED.match_request,
         match_accepted = EXCLUDED.match_accepted,
         reminder_24h   = EXCLUDED.reminder_24h,
         reminder_2h    = EXCLUDED.reminder_2h,
         new_players    = EXCLUDED.new_players,
         post_expiring  = EXCLUDED.post_expiring`,
      [req.user.id, matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring]
    )
    return res.json({ success: true })
  } catch {
    return res.json({ success: true })
  }
})

module.exports = router
