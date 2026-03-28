const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
  // silently handle — routes fall back to mock data
})

const query = (text, params) => pool.query(text, params)

module.exports = { query, pool }
