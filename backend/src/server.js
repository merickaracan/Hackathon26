require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes    = require('./routes/auth')
const playerRoutes  = require('./routes/players')
const postRoutes    = require('./routes/posts')
const requestRoutes = require('./routes/requests')
const matchRoutes   = require('./routes/matches')
const userRoutes    = require('./routes/users')

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',    authRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/posts',   postRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/users',   userRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`Sinder backend running on http://localhost:${PORT}`))
