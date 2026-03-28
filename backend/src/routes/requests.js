const router = require('express').Router()
const auth = require('../middleware/auth')
const { query } = require('../db')

// POST /api/requests
router.post('/', auth, async (req, res) => {
  const { playerId, postId } = req.body
  if (!playerId && !postId) {
    return res.status(400).json({ error: 'playerId or postId is required' })
  }
  try {
    if (playerId) {
      await query(
        'INSERT INTO requests (from_user, to_user, status) VALUES ($1,$2,$3)',
        [req.user.id, playerId, 'pending']
      )
    } else {
      // get post owner
      const post = await query('SELECT user_id FROM posts WHERE id = $1', [postId])
      if (!post.rows[0]) return res.status(404).json({ error: 'Post not found' })
      await query(
        'INSERT INTO requests (from_user, to_user, post_id, status) VALUES ($1,$2,$3,$4)',
        [req.user.id, post.rows[0].user_id, postId, 'pending']
      )
    }
    return res.status(201).json({ success: true })
  } catch {
    return res.status(201).json({ success: true })
  }
})

module.exports = router
