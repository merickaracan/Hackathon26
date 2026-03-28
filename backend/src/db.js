const { Pool } = require('pg')

// Strip sslmode from the URL so the Pool ssl option takes full control
const connectionString = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '')

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

pool.on('error', (err) => {
  console.error('❌ Database connection lost:', err.message)
})

const query = (text, params) => pool.query(text, params)

pool.query('SELECT 1')
  .then(() => console.log('✅ Connected to Aiven PostgreSQL database'))
  .catch((err) => {
    console.error('❌ Failed to connect to Aiven database:', err.message)
    process.exit(1)
  })

module.exports = { query, pool }
