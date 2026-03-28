# Sinder – Backend

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Configure environment
   ```bash
   cp .env.example .env
   # Set DATABASE_URL and JWT_SECRET
   ```

3. Set up the database (requires PostgreSQL)
   ```bash
   psql -U postgres -d sinder -f schema.sql
   ```

4. Run the dev server
   ```bash
   npm run dev
   ```

Server runs on http://localhost:3000

## Without a database
If a route cannot read from the database, it returns an empty list (no demo players or sessions).

## Endpoints
| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/players/nearby | ✅ |
| GET | /api/posts | ✅ |
| POST | /api/posts | ✅ |
| POST | /api/requests | ✅ |
| GET | /api/matches | ✅ |
| PATCH | /api/users/me/notifications | ✅ |
