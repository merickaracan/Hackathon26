const router = require('express').Router()
const auth = require('../middleware/requireAuth')
const { query } = require('../../database/db')

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

function parseSport(sports) {
  if (typeof sports === 'string') {
    try { sports = JSON.parse(sports) } catch { return null }
  }
  return Array.isArray(sports) && sports[0] ? sports[0].sport : null
}

router.get('/', auth, async (req, res) => {
  const uid = req.user.id
  try {
    // Confirmed — I sent the request and it was accepted
    const sentConfirmedQ = await query(
      `SELECT r.id, u.name, u.sports, p.sport AS post_sport
       FROM requests r
       JOIN users u ON u.id = r.to_user
       LEFT JOIN posts p ON p.id = r.post_id
       WHERE r.from_user = $1 AND r.status = 'accepted'`,
      [uid]
    )
    // Confirmed — someone sent me a request and I accepted it
    const receivedConfirmedQ = await query(
      `SELECT r.id, u.name, u.sports, p.sport AS post_sport
       FROM requests r
       JOIN users u ON u.id = r.from_user
       LEFT JOIN posts p ON p.id = r.post_id
       WHERE r.to_user = $1 AND r.status = 'accepted'`,
      [uid]
    )

    // Requests I sent that are still pending
    const sentPendingQ = await query(
      `SELECT r.id, u.name, u.sports, p.sport AS post_sport, r.created_at
       FROM requests r
       JOIN users u ON u.id = r.to_user
       LEFT JOIN posts p ON p.id = r.post_id
       WHERE r.from_user = $1 AND r.status = 'pending'`,
      [uid]
    )

    // Requests sent TO me that need my response
    const incomingQ = await query(
      `SELECT r.id, u.name, u.sports, p.sport AS post_sport, p.location, p.datetime, r.created_at
       FROM requests r
       JOIN users u ON u.id = r.from_user
       LEFT JOIN posts p ON p.id = r.post_id
       WHERE r.to_user = $1 AND r.status = 'pending'`,
      [uid]
    )

    const toConfirmed = (r) => ({
      id: r.id,
      name: r.name,
      sport: r.post_sport || parseSport(r.sports),
      detail: `${r.post_sport || parseSport(r.sports) || 'Sport'} · confirmed`,
    })

    return res.json({
      confirmed: [
        ...sentConfirmedQ.rows.map(toConfirmed),
        ...receivedConfirmedQ.rows.map(toConfirmed),
      ],
      pending: sentPendingQ.rows.map(r => ({
        id: r.id,
        name: r.name,
        sport: r.post_sport || parseSport(r.sports),
        detail: `${r.post_sport || parseSport(r.sports) || 'Sport'} · Sent ${timeAgo(r.created_at)}`,
      })),
      incoming: incomingQ.rows.map(r => ({
        id: r.id,
        name: r.name,
        sport: r.post_sport || parseSport(r.sports),
        location: r.location || null,
        datetime: r.datetime || null,
        detail: `Wants to join · ${timeAgo(r.created_at)}`,
      })),
    })
  } catch (err) {
    console.error('GET /matches error:', err.message)
    return res.json({ confirmed: [], pending: [], incoming: [] })
  }
})

module.exports = router
