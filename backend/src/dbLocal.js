const { Pool } = require('pg')

// Strip sslmode from URL so the Pool ssl option takes full control
const connectionString = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '')

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

pool.query('SELECT 1')
  .then(() => console.log('✅ Connected to Aiven PostgreSQL database'))
  .catch((err) => {
    console.error('❌ Failed to connect to Aiven database:', err.message)
    process.exit(1)
  })

module.exports = pool
