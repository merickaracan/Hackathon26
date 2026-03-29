const { query } = require('../database/db')

/**
 * Fetch a user by email — includes password hash, for auth only
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const getUserByEmail = async (email) => {
  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    return rows[0] || null
  } catch (err) {
    console.error('getUserByEmail error:', err.message)
    throw err
  }
}

/**
 * Fetch a user's full profile by ID — excludes password
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
const getUserById = async (id) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, sports, availability, university, location,
              notif_match_request, notif_match_accepted, notif_reminder_24h,
              notif_reminder_2h, notif_new_players, notif_post_expiring,
              avatar, instagram, created_at
       FROM users WHERE id = $1`,
      [id]
    )
    if (!rows[0]) return null
    const user = rows[0]
    if (typeof user.sports === 'string') {
      try { user.sports = JSON.parse(user.sports) } catch { user.sports = [] }
    }
    if (typeof user.availability === 'string') {
      try { user.availability = JSON.parse(user.availability) } catch { user.availability = [] }
    }
    return user
  } catch (err) {
    console.error('getUserById error:', err.message)
    throw err
  }
}

/**
 * Insert a new user and return the created record
 * @param {string} name
 * @param {string} email
 * @param {string} hashedPassword
 * @param {string} sport  - primary sport
 * @param {string} skillLevel - 'beginner' | 'intermediate' | 'advanced'
 * @returns {Promise<Object>} created user row
 */
const createUser = async (name, email, hashedPassword, sport, skillLevel, instagram = null) => {
  const sports = JSON.stringify([{ sport, skill: skillLevel }])
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, sports, instagram)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, sports, created_at`,
      [name, email, hashedPassword, sports, instagram || null]
    )
    const user = rows[0]
    if (user && typeof user.sports === 'string') {
      try { user.sports = JSON.parse(user.sports) } catch { user.sports = [] }
    }
    return user
  } catch (err) {
    console.error('createUser error:', err.message)
    throw err
  }
}

/**
 * Update editable profile fields (name, university, location, sports, availability)
 * Only fields present in `updates` are changed.
 * @param {number} id
 * @param {Object} updates - subset of { name, university, location, sports, availability }
 * @returns {Promise<Object|null>} updated user row
 */
const updateUserProfile = async (id, updates = {}) => {
  const allowed = ['name', 'university', 'location', 'sports', 'availability', 'avatar', 'instagram']
  const fields = []
  const values = []
  let i = 1

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${i++}`)
      values.push(
        key === 'sports' || key === 'availability'
          ? JSON.stringify(updates[key])
          : updates[key]
      )
    }
  }

  if (fields.length === 0) return null

  values.push(id)
  try {
    const { rows } = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, name, email, sports, university, location, avatar`,
      values
    )
    return rows[0] || null
  } catch (err) {
    console.error('updateUserProfile error:', err.message)
    throw err
  }
}

/**
 * Update notification preferences for a user
 * @param {number} id
 * @param {Object} prefs - { matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring }
 * @returns {Promise<void>}
 */
const updateUserNotifications = async (id, prefs) => {
  const { matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring } = prefs
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
      [matchRequest, matchAccepted, reminder24h, reminder2h, newPlayers, postExpiring, id]
    )
  } catch (err) {
    console.error('updateUserNotifications error:', err.message)
    throw err
  }
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserNotifications,
}
