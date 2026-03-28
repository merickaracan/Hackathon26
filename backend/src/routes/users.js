const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { getUserById, updateUserProfile, updateUserNotifications } = require('../userService')

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json(user)
  } catch (err) {
    console.error('GET /users/me error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PATCH /api/users/me
router.patch('/me', auth, async (req, res) => {
  try {
    const updated = await updateUserProfile(req.user.id, req.body)
    if (!updated) return res.status(400).json({ error: 'No valid fields to update' })
    if (typeof updated.sports === 'string') {
      try { updated.sports = JSON.parse(updated.sports) } catch { updated.sports = [] }
    }
    return res.json(updated)
  } catch (err) {
    console.error('PATCH /users/me error:', err.message)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
})

// PATCH /api/users/me/notifications
router.patch('/me/notifications', auth, async (req, res) => {
  try {
    await updateUserNotifications(req.user.id, req.body)
    return res.json({ success: true })
  } catch (err) {
    console.error('PATCH /notifications error:', err.message)
    return res.status(500).json({ error: 'Failed to update preferences' })
  }
})

module.exports = router
