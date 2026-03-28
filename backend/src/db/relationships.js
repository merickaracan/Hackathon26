const { query } = require('../../database/db')

function parseSports(raw) {
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
  return Array.isArray(raw) ? raw : []
}

// Get the current direct (non-session) relationship between two users.
// Returns null if none exists, otherwise { id, status, from_user, to_user }
async function getRelationship(userAId, userBId) {
  const sentQ = await query(
    `SELECT id, status, from_user, to_user, created_at
     FROM requests
     WHERE from_user = $1 AND to_user = $2 AND post_id IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userAId, userBId]
  )
  if (sentQ.rows[0]) return sentQ.rows[0]

  const receivedQ = await query(
    `SELECT id, status, from_user, to_user, created_at
     FROM requests
     WHERE from_user = $1 AND to_user = $2 AND post_id IS NULL
     ORDER BY created_at DESC LIMIT 1`,
    [userBId, userAId]
  )
  return receivedQ.rows[0] || null
}

// True if a pending or accepted direct relationship exists between the two users
async function hasActiveRelationship(userAId, userBId) {
  const rel = await getRelationship(userAId, userBId)
  return !!rel && (rel.status === 'pending' || rel.status === 'accepted')
}

// Send a direct match request. Throws 'ALREADY_EXISTS' if one already exists.
async function sendMatchRequest(senderId, recipientId) {
  const exists = await hasActiveRelationship(senderId, recipientId)
  if (exists) throw new Error('ALREADY_EXISTS')

  const { rows } = await query(
    `INSERT INTO requests (from_user, to_user, status) VALUES ($1, $2, 'pending') RETURNING id, status, from_user, to_user`,
    [senderId, recipientId]
  )
  return rows[0]
}

// Accept a pending direct request. Only the recipient can call this.
async function acceptMatchRequest(requestId, recipientId) {
  const { rows: check } = await query(
    `SELECT id FROM requests WHERE id = $1 AND to_user = $2 AND status = 'pending' AND post_id IS NULL`,
    [requestId, recipientId]
  )
  if (!check[0]) throw new Error('REQUEST_NOT_FOUND')

  const { rows } = await query(
    `UPDATE requests SET status = 'accepted' WHERE id = $1 RETURNING id, status`,
    [requestId]
  )
  return rows[0]
}

// Decline a pending request — deletes the row entirely so sender can re-request later.
async function declineMatchRequest(requestId, recipientId) {
  const { rows } = await query(
    `DELETE FROM requests WHERE id = $1 AND to_user = $2 AND status = 'pending' AND post_id IS NULL RETURNING id`,
    [requestId, recipientId]
  )
  if (!rows[0]) throw new Error('REQUEST_NOT_FOUND')
  return rows[0]
}

// Cancel a pending request (sender withdraws before it is accepted).
async function cancelMatchRequest(requestId, senderId) {
  const { rows } = await query(
    `DELETE FROM requests WHERE id = $1 AND from_user = $2 AND status = 'pending' AND post_id IS NULL RETURNING id`,
    [requestId, senderId]
  )
  if (!rows[0]) throw new Error('REQUEST_NOT_FOUND')
  return rows[0]
}

// Unmatch — deletes the accepted relationship entirely so either party can re-request.
async function unmatch(userId, otherUserId) {
  const rel = await getRelationship(userId, otherUserId)
  if (!rel || rel.status !== 'accepted') throw new Error('MATCH_NOT_FOUND')

  await query(`DELETE FROM requests WHERE id = $1`, [rel.id])
  return { success: true }
}

// Get all direct relationships for a user, with direction ('sent' | 'received').
// Used to populate the Connections page.
async function getUserRelationships(userId) {
  const sentQ = await query(
    `SELECT r.id, r.status, r.from_user, r.to_user, r.created_at,
            u.name AS other_name, u.sports AS other_sports
     FROM requests r
     JOIN users u ON u.id = r.to_user
     WHERE r.from_user = $1 AND r.post_id IS NULL AND r.status IN ('pending', 'accepted')
     ORDER BY r.created_at DESC`,
    [userId]
  )
  const receivedQ = await query(
    `SELECT r.id, r.status, r.from_user, r.to_user, r.created_at,
            u.name AS other_name, u.sports AS other_sports
     FROM requests r
     JOIN users u ON u.id = r.from_user
     WHERE r.to_user = $1 AND r.post_id IS NULL AND r.status IN ('pending', 'accepted')
     ORDER BY r.created_at DESC`,
    [userId]
  )

  const shape = (direction) => (r) => {
    const sports = parseSports(r.other_sports)
    return {
      id: r.id,
      status: r.status,
      direction,
      other_user_id: direction === 'sent' ? r.to_user : r.from_user,
      other_user_name: r.other_name,
      sport: sports[0]?.sport || null,
      skill: sports[0]?.skill || null,
      created_at: r.created_at,
    }
  }

  return [...sentQ.rows.map(shape('sent')), ...receivedQ.rows.map(shape('received'))]
}

// Get a map of { [otherUserId]: { status, id, direction } } for a batch of other users.
// Used by the Discover page to initialise every player card in one shot.
async function getRelationshipStatuses(userId) {
  const sentQ = await query(
    `SELECT id, to_user AS other_id, status FROM requests
     WHERE from_user = $1 AND post_id IS NULL AND status IN ('pending','accepted')`,
    [userId]
  )
  const receivedQ = await query(
    `SELECT id, from_user AS other_id, status FROM requests
     WHERE to_user = $1 AND post_id IS NULL AND status IN ('pending','accepted')`,
    [userId]
  )

  const map = {}
  for (const r of sentQ.rows)     map[r.other_id] = { id: r.id, status: r.status, direction: 'sent' }
  for (const r of receivedQ.rows) map[r.other_id] = { id: r.id, status: r.status, direction: 'received' }
  return map
}

module.exports = {
  getRelationship,
  hasActiveRelationship,
  sendMatchRequest,
  acceptMatchRequest,
  declineMatchRequest,
  cancelMatchRequest,
  unmatch,
  getUserRelationships,
  getRelationshipStatuses,
}
