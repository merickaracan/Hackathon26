require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const auth     = require('./src/routes/auth');
const matches  = require('./src/routes/matches');
const players  = require('./src/routes/players');
const requests = require('./src/routes/requests');
const users    = require('./src/routes/users');
const posts    = require('./src/routes/posts');
const friends  = require('./src/routes/friends');
const ratings  = require('./src/routes/ratings');

app.use('/api/auth',     auth);
app.use('/api/matches',  matches);
app.use('/api/players',  players);
app.use('/api/requests', requests);
app.use('/api/users',    users);
app.use('/api/posts',    posts);
app.use('/api/friends',  friends);
app.use('/api/ratings',  ratings);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

module.exports = app;
