/**
 * Seed script — run with:  node database/seed.js
 *
 * Creates demo users, sessions, match requests, and friendships
 * so the app is fully populated for a presentation.
 *
 * All demo accounts use password:  demo1234
 */

require('dotenv').config()
const bcrypt = require('bcrypt')

// Give dbLocal time to finish CREATE TABLE IF NOT EXISTS calls
setTimeout(async () => {
  const { query } = require('./db')

  const PASSWORD = 'demo1234'
  const hash = await bcrypt.hash(PASSWORD, 10)

  // ── USERS ────────────────────────────────────────────────────────────────

  const users = [
    {
      name: 'Alex Johnson',
      email: 'alex@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'tennis', skill: 'intermediate' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'alexjohnson_tennis',
    },
    {
      name: 'Maya Patel',
      email: 'maya@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'padel', skill: 'beginner' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'maya.padel',
    },
    {
      name: 'Ravi Sharma',
      email: 'ravi@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'football', skill: 'advanced' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'ravisharma.fc',
    },
    {
      name: 'Sophie Chen',
      email: 'sophie@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'basketball', skill: 'intermediate' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'sophiechen_hoops',
    },
    {
      name: 'James Williams',
      email: 'james@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'running', skill: 'advanced' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'jameswilliams.run',
    },
    {
      name: 'Emma Turner',
      email: 'emma@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'tennis', skill: 'beginner' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'emma.turner_',
    },
    {
      name: 'Luca Ferrari',
      email: 'luca@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'cycling', skill: 'intermediate' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'lucaferrari.rides',
    },
    {
      name: 'Priya Kapoor',
      email: 'priya@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'swimming', skill: 'beginner' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'priya.swims',
    },
    {
      name: 'Tom Bradley',
      email: 'tom@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'golf', skill: 'intermediate' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'tombradley.golf',
    },
    {
      name: 'Zara Ahmed',
      email: 'zara@bath.ac.uk',
      sports: JSON.stringify([{ sport: 'football', skill: 'intermediate' }]),
      university: 'University of Bath',
      location: 'Bath, UK',
      instagram: 'zara.ahmed.fc',
    },
  ]

  console.log('🌱 Seeding users…')
  const userIds = {}
  for (const u of users) {
    await query(
      `INSERT OR IGNORE INTO users (name, email, password, sports, university, location, instagram)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [u.name, u.email, hash, u.sports, u.university, u.location, u.instagram]
    )
    // Always update instagram so existing rows get the handle too
    await query(
      `UPDATE users SET instagram = $1 WHERE email = $2`,
      [u.instagram, u.email]
    )
    const { rows } = await query(`SELECT id FROM users WHERE email = $1`, [u.email])
    userIds[u.email] = rows[0].id
    console.log(`  ✅ ${u.name} (id ${rows[0].id})`)
  }

  // ── SESSIONS / POSTS ──────────────────────────────────────────────────────

  const now = new Date()
  const future = (days, hour = 10) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

  const sessions = [
    {
      email: 'alex@bath.ac.uk',
      sport: 'tennis',
      format: 'Singles',
      datetime: future(2, 9),
      location: 'Sports Training Village, Court 3',
      description: 'Looking for a hitting partner this Sunday at 9am. Around 3.5–4.0 level. All standards welcome for a friendly knock.',
      spots: 1,
    },
    {
      email: 'ravi@bath.ac.uk',
      sport: 'football',
      format: '5-a-side',
      datetime: future(3, 14),
      location: 'Sports Training Village, Astro Pitch 2',
      description: 'Organising a 5-a-side on Wednesday afternoon — need two more players. Mixed ability, just for fun.',
      spots: 4,
    },
    {
      email: 'maya@bath.ac.uk',
      sport: 'padel',
      format: 'Mixed doubles',
      datetime: future(4, 11),
      location: 'Bath Padel Club',
      description: 'Beginner padel player, just started last term. Looking for a relaxed doubles partner — any level welcome, the more the merrier.',
      spots: 3,
    },
    {
      email: 'sophie@bath.ac.uk',
      sport: 'basketball',
      format: 'Pickup 3v3',
      datetime: future(1, 18),
      location: 'Sports Hall, Court B',
      description: 'Running a casual 3v3 pickup tomorrow evening. Intermediate level. Bring your own water.',
      spots: 5,
    },
    {
      email: 'james@bath.ac.uk',
      sport: 'running',
      format: 'Group run',
      datetime: future(2, 7),
      location: 'Meet at STV main entrance',
      description: 'Easy 8k run around campus and the canal path. Pace around 5:30/km. Good for all levels — we will not leave anyone behind.',
      spots: 6,
    },
    {
      email: 'luca@bath.ac.uk',
      sport: 'cycling',
      format: 'Road ride',
      datetime: future(5, 8),
      location: 'Pulteney Bridge, Bath',
      description: 'Weekend road ride out to Frome and back (~45km). Moderate pace. Road bikes preferred but hybrids welcome.',
      spots: 4,
    },
    {
      email: 'priya@bath.ac.uk',
      sport: 'swimming',
      format: 'Lane swim',
      datetime: future(1, 7),
      location: 'STV 50m Pool, Slow Lane',
      description: 'Early morning lane swim, roughly 2km. Slow lane, very relaxed — more about getting in the water than speed.',
      spots: 3,
    },
    {
      email: 'tom@bath.ac.uk',
      sport: 'golf',
      format: '9 holes',
      datetime: future(6, 10),
      location: 'Entry Hill Golf Course, Bath',
      description: 'Looking for one or two more players for a casual 9-hole round next Sunday. All handicaps welcome.',
      spots: 2,
    },
  ]

  console.log('\n🌱 Seeding sessions…')
  const sessionIds = {}
  for (const s of sessions) {
    const userId = userIds[s.email]
    const res = await query(
      `INSERT INTO posts (user_id, sport, format, datetime, location, description, spots)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [userId, s.sport, s.format, s.datetime, s.location, s.description, s.spots]
    )
    sessionIds[s.email] = res.rows[0].id
    console.log(`  ✅ ${s.sport} session by ${s.email} (id ${res.rows[0].id})`)
  }

  // ── MATCH REQUESTS ────────────────────────────────────────────────────────
  // accepted: Alex ↔ Sophie,  Ravi ↔ Emma,  James ↔ Zara
  // pending (sent):  Maya → Alex,  Tom → Sophie,  Luca → James

  const matchRequests = [
    // accepted pairs — insert as from→to then set accepted
    { from: 'alex@bath.ac.uk',  to: 'sophie@bath.ac.uk', status: 'accepted' },
    { from: 'ravi@bath.ac.uk',  to: 'emma@bath.ac.uk',   status: 'accepted' },
    { from: 'james@bath.ac.uk', to: 'zara@bath.ac.uk',   status: 'accepted' },
    // pending — receiver hasn't responded yet
    { from: 'maya@bath.ac.uk',  to: 'alex@bath.ac.uk',   status: 'pending'  },
    { from: 'tom@bath.ac.uk',   to: 'sophie@bath.ac.uk', status: 'pending'  },
    { from: 'luca@bath.ac.uk',  to: 'james@bath.ac.uk',  status: 'pending'  },
    { from: 'priya@bath.ac.uk', to: 'maya@bath.ac.uk',   status: 'pending'  },
  ]

  console.log('\n🌱 Seeding match requests…')
  for (const r of matchRequests) {
    await query(
      `INSERT INTO requests (from_user, to_user, post_id, status)
       VALUES ($1, $2, NULL, $3)`,
      [userIds[r.from], userIds[r.to], r.status]
    )
    console.log(`  ✅ ${r.from} → ${r.to} [${r.status}]`)
  }

  // ── SESSION JOIN REQUESTS ─────────────────────────────────────────────────
  // Sophie joining Ravi's football session (accepted)
  // Emma joining Alex's tennis session (pending)
  // Zara joining Ravi's football session (pending)

  const sessionRequests = [
    { from: 'sophie@bath.ac.uk', sessionOwner: 'ravi@bath.ac.uk',  status: 'accepted' },
    { from: 'emma@bath.ac.uk',   sessionOwner: 'alex@bath.ac.uk',  status: 'pending'  },
    { from: 'zara@bath.ac.uk',   sessionOwner: 'ravi@bath.ac.uk',  status: 'pending'  },
    { from: 'alex@bath.ac.uk',   sessionOwner: 'james@bath.ac.uk', status: 'pending'  },
  ]

  console.log('\n🌱 Seeding session join requests…')
  for (const r of sessionRequests) {
    const postId = sessionIds[r.sessionOwner]
    const toUser = userIds[r.sessionOwner]
    await query(
      `INSERT INTO requests (from_user, to_user, post_id, status)
       VALUES ($1, $2, $3, $4)`,
      [userIds[r.from], toUser, postId, r.status]
    )
    console.log(`  ✅ ${r.from} → ${r.sessionOwner}'s session [${r.status}]`)
  }

  // ── FRIENDSHIPS ───────────────────────────────────────────────────────────

  const friendships = [
    { from: 'alex@bath.ac.uk',  to: 'ravi@bath.ac.uk',  status: 'accepted' },
    { from: 'maya@bath.ac.uk',  to: 'sophie@bath.ac.uk', status: 'accepted' },
    { from: 'emma@bath.ac.uk',  to: 'james@bath.ac.uk',  status: 'pending'  },
    { from: 'luca@bath.ac.uk',  to: 'tom@bath.ac.uk',    status: 'accepted' },
  ]

  console.log('\n🌱 Seeding friendships…')
  for (const f of friendships) {
    await query(
      `INSERT INTO friendships (from_user, to_user, status) VALUES ($1, $2, $3)`,
      [userIds[f.from], userIds[f.to], f.status]
    )
    console.log(`  ✅ ${f.from} ↔ ${f.to} [${f.status}]`)
  }

  // ── EXTRA ACCEPTED MATCH REQUESTS (needed for rating connectivity) ─────────

  const extraMatches = [
    { from: 'emma@bath.ac.uk',  to: 'alex@bath.ac.uk',   status: 'accepted' },
    { from: 'ravi@bath.ac.uk',  to: 'sophie@bath.ac.uk', status: 'accepted' },
    { from: 'priya@bath.ac.uk', to: 'luca@bath.ac.uk',   status: 'accepted' },
    { from: 'tom@bath.ac.uk',   to: 'luca@bath.ac.uk',   status: 'accepted' },
    { from: 'maya@bath.ac.uk',  to: 'emma@bath.ac.uk',   status: 'accepted' },
    { from: 'zara@bath.ac.uk',  to: 'ravi@bath.ac.uk',   status: 'accepted' },
  ]

  console.log('\n🌱 Seeding extra match connections…')
  for (const r of extraMatches) {
    await query(
      `INSERT INTO requests (from_user, to_user, post_id, status) VALUES ($1, $2, NULL, $3)`,
      [userIds[r.from], userIds[r.to], r.status]
    )
    console.log(`  ✅ ${r.from} ↔ ${r.to} [${r.status}]`)
  }

  // ── PAST SESSIONS ─────────────────────────────────────────────────────────

  const past = (daysAgo, hour = 10) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

  const pastSessions = [
    {
      key:   'alex_tennis',
      email: 'alex@bath.ac.uk',
      sport: 'tennis',
      format: 'Singles',
      datetime: past(5, 10),
      location: 'Sports Training Village, Court 1',
      description: 'Sunday morning singles hit — 3.5 level, friendly rally.',
    },
    {
      key:   'ravi_football',
      email: 'ravi@bath.ac.uk',
      sport: 'football',
      format: '5-a-side',
      datetime: past(8, 15),
      location: 'Sports Training Village, Astro Pitch 1',
      description: 'Wednesday afternoon 5-a-side. Mixed ability, high intensity.',
    },
    {
      key:   'james_running',
      email: 'james@bath.ac.uk',
      sport: 'running',
      format: 'Group run',
      datetime: past(3, 7),
      location: 'Meet at STV main entrance',
      description: '8k canal path run. Easy conversational pace.',
    },
    {
      key:   'sophie_basketball',
      email: 'sophie@bath.ac.uk',
      sport: 'basketball',
      format: 'Pickup 3v3',
      datetime: past(10, 18),
      location: 'Sports Hall, Court B',
      description: 'Evening pickup 3v3 — casual but competitive.',
    },
    {
      key:   'luca_cycling',
      email: 'luca@bath.ac.uk',
      sport: 'cycling',
      format: 'Road ride',
      datetime: past(6, 8),
      location: 'Pulteney Bridge, Bath',
      description: '45km road ride out to Frome. Steady pace.',
    },
    {
      key:   'priya_swimming',
      email: 'priya@bath.ac.uk',
      sport: 'swimming',
      format: 'Lane swim',
      datetime: past(12, 7),
      location: 'STV 50m Pool, Slow Lane',
      description: 'Early morning 2km lane swim. Relaxed pace, slow lane.',
    },
    {
      key:   'tom_golf',
      email: 'tom@bath.ac.uk',
      sport: 'golf',
      format: '9 holes',
      datetime: past(14, 10),
      location: 'Entry Hill Golf Course, Bath',
      description: 'Casual 9-hole round — all handicaps, just enjoying the course.',
    },
    {
      key:   'zara_football',
      email: 'zara@bath.ac.uk',
      sport: 'football',
      format: '7-a-side',
      datetime: past(9, 16),
      location: 'University of Bath Astro, Pitch 3',
      description: 'Mixed ability 7-a-side — good game, high energy throughout.',
    },
    {
      key:   'maya_padel',
      email: 'maya@bath.ac.uk',
      sport: 'padel',
      format: 'Mixed doubles',
      datetime: past(11, 11),
      location: 'Bath Padel Club, Court 2',
      description: 'Beginner-friendly doubles — great fun despite the wind.',
    },
  ]

  console.log('\n🌱 Seeding past sessions…')
  const pastSessionIds = {}
  for (const s of pastSessions) {
    const userId = userIds[s.email]
    const res = await query(
      `INSERT INTO posts (user_id, sport, format, datetime, location, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, s.sport, s.format, s.datetime, s.location, s.description]
    )
    pastSessionIds[s.key] = res.rows[0].id
    console.log(`  ✅ past ${s.sport} session by ${s.email} (id ${res.rows[0].id})`)
  }

  // ── PAST SESSION JOIN REQUESTS ────────────────────────────────────────────
  // Each entry links a participant to a past session (accepted)

  const pastJoins = [
    // Alex's tennis: Sophie + Emma joined
    { from: 'sophie@bath.ac.uk', session: 'alex_tennis',      owner: 'alex@bath.ac.uk'  },
    { from: 'emma@bath.ac.uk',   session: 'alex_tennis',      owner: 'alex@bath.ac.uk'  },
    // Ravi's football: Emma + Zara + Sophie joined
    { from: 'emma@bath.ac.uk',   session: 'ravi_football',    owner: 'ravi@bath.ac.uk'  },
    { from: 'zara@bath.ac.uk',   session: 'ravi_football',    owner: 'ravi@bath.ac.uk'  },
    { from: 'sophie@bath.ac.uk', session: 'ravi_football',    owner: 'ravi@bath.ac.uk'  },
    // James's running: Zara + Alex joined
    { from: 'zara@bath.ac.uk',   session: 'james_running',    owner: 'james@bath.ac.uk' },
    { from: 'alex@bath.ac.uk',   session: 'james_running',    owner: 'james@bath.ac.uk' },
    // Sophie's basketball: Alex + Ravi joined
    { from: 'alex@bath.ac.uk',   session: 'sophie_basketball', owner: 'sophie@bath.ac.uk' },
    { from: 'ravi@bath.ac.uk',   session: 'sophie_basketball', owner: 'sophie@bath.ac.uk' },
    // Luca's cycling: Tom joined
    { from: 'tom@bath.ac.uk',    session: 'luca_cycling',     owner: 'luca@bath.ac.uk'  },
    // Priya's swimming: Luca joined
    { from: 'luca@bath.ac.uk',   session: 'priya_swimming',   owner: 'priya@bath.ac.uk' },
    // Tom's golf: Luca joined
    { from: 'luca@bath.ac.uk',   session: 'tom_golf',         owner: 'tom@bath.ac.uk'   },
    // Zara's football: Ravi + James joined
    { from: 'ravi@bath.ac.uk',   session: 'zara_football',    owner: 'zara@bath.ac.uk'  },
    { from: 'james@bath.ac.uk',  session: 'zara_football',    owner: 'zara@bath.ac.uk'  },
    // Maya's padel: Emma joined
    { from: 'emma@bath.ac.uk',   session: 'maya_padel',       owner: 'maya@bath.ac.uk'  },
  ]

  console.log('\n🌱 Seeding past session joins…')
  for (const j of pastJoins) {
    await query(
      `INSERT INTO requests (from_user, to_user, post_id, status) VALUES ($1, $2, $3, 'accepted')`,
      [userIds[j.from], userIds[j.owner], pastSessionIds[j.session]]
    ).catch(() => {})
    console.log(`  ✅ ${j.from} joined ${j.session}`)
  }

  // ── RATINGS ───────────────────────────────────────────────────────────────
  // Intentionally INCOMPLETE — some participants left unrated to populate "Awaiting"
  //
  // Alex's tennis (Sophie + Emma):    Sophie rated ✓, Emma NOT rated → Awaiting
  // Ravi's football (Emma+Zara+Sophie): Emma + Sophie rated ✓, Zara NOT rated → Awaiting
  // James's running (Zara + Alex):    Both rated ✓ → Already Rated
  // Sophie's basketball (Alex + Ravi): Alex rated ✓, Ravi NOT rated → Awaiting
  // Luca's cycling (Tom):             Tom NOT rated → Awaiting
  // Priya's swimming (Luca):          Luca rated ✓ → Already Rated
  // Tom's golf (Luca):                Luca rated ✓ → Already Rated
  // Zara's football (Ravi + James):   Both rated ✓ → Already Rated
  // Maya's padel (Emma):              Emma NOT rated → Awaiting

  const ratings = [
    // ── Already rated sessions ────────────────────────────────────────────
    // Alex rated Sophie for tennis ✓ (tennis session → fully rated once Emma done, but Emma not rated)
    {
      from: 'alex@bath.ac.uk', to: 'sophie@bath.ac.uk', sport: 'tennis', skill: 'intermediate',
      comment: 'Really consistent from the baseline and a smart serve. Backhand is a work in progress but overall a great hit — would absolutely play again.',
    },
    // James rated Zara + Alex → running session fully rated
    {
      from: 'james@bath.ac.uk', to: 'zara@bath.ac.uk', sport: 'running', skill: 'advanced',
      comment: 'Kept up a brutal pace without breaking a sweat. Really pushed the group — exactly the kind of runner you want pacing a long run.',
    },
    {
      from: 'james@bath.ac.uk', to: 'alex@bath.ac.uk', sport: 'running', skill: 'intermediate',
      comment: 'Good steady runner, great attitude. Hung on well in the second half — solid effort for someone who doesn\'t train as much.',
    },
    // Sophie rated Alex for basketball ✓ (basketball session, Ravi still unrated)
    {
      from: 'sophie@bath.ac.uk', to: 'alex@bath.ac.uk', sport: 'basketball', skill: 'intermediate',
      comment: 'Great court awareness and moves well without the ball. Gets a bit passive on defence but offensively really solid.',
    },
    // Ravi rated Emma for football ✓ + rated Sophie ✓
    {
      from: 'ravi@bath.ac.uk', to: 'emma@bath.ac.uk', sport: 'football', skill: 'intermediate',
      comment: 'Good movement off the ball and smart passing decisions. Great energy, kept up with the pace really well. Fun session.',
    },
    {
      from: 'ravi@bath.ac.uk', to: 'sophie@bath.ac.uk', sport: 'football', skill: 'beginner',
      comment: 'Good effort and enthusiasm — clearly more of a basketball player but gave it 100%. Showed good improvement as the game went on.',
    },
    // Priya rated Luca for swimming → fully rated
    {
      from: 'priya@bath.ac.uk', to: 'luca@bath.ac.uk', sport: 'swimming', skill: 'intermediate',
      comment: 'Smooth stroke and a very comfortable pace. Much better technique than expected for someone who mainly cycles. Good lane partner.',
    },
    // Tom rated Luca for golf → fully rated
    {
      from: 'tom@bath.ac.uk', to: 'luca@bath.ac.uk', sport: 'golf', skill: 'beginner',
      comment: 'First time on a golf course but brilliant fun to play with. Hit a couple of surprisingly good shots — natural feel for it.',
    },
    // Zara's football: Ravi + James both rated
    {
      from: 'zara@bath.ac.uk', to: 'ravi@bath.ac.uk', sport: 'football', skill: 'advanced',
      comment: 'Incredible on the ball — controls the tempo of the whole game. A bit dominant but you learn a lot just playing alongside them.',
    },
    {
      from: 'zara@bath.ac.uk', to: 'james@bath.ac.uk', sport: 'football', skill: 'intermediate',
      comment: 'Works harder than anyone else on the pitch. Doesn\'t have the most technical game but the effort and positioning more than make up for it.',
    },

    // ── Reviews received (others rating the logged-in demo users) ─────────
    // Sophie rated Alex for tennis
    {
      from: 'sophie@bath.ac.uk', to: 'alex@bath.ac.uk', sport: 'tennis', skill: 'intermediate',
      comment: 'Great serve and really consistent from the baseline. Backhand could improve but overall a really fun hit — would play again for sure.',
    },
    // Emma rated Ravi for football
    {
      from: 'emma@bath.ac.uk', to: 'ravi@bath.ac.uk', sport: 'football', skill: 'advanced',
      comment: 'Absolute rocket of a shot. Way stronger on the ball than I expected — definitely advanced. Scored twice and set up two more.',
    },
    // Zara rated James for running
    {
      from: 'zara@bath.ac.uk', to: 'james@bath.ac.uk', sport: 'running', skill: 'advanced',
      comment: 'Insane pace for an "easy" run. I was hanging on by the end — exactly what I needed to push myself. Would 100% run with them again.',
    },
    // Alex rated James for running
    {
      from: 'alex@bath.ac.uk', to: 'james@bath.ac.uk', sport: 'running', skill: 'advanced',
      comment: 'Great pacer, kept things conversational despite the speed. Really motivating — felt like I improved just from one session.',
    },
    // Luca rated Priya for swimming
    {
      from: 'luca@bath.ac.uk', to: 'priya@bath.ac.uk', sport: 'swimming', skill: 'intermediate',
      comment: 'Elegant technique and a calming presence in the lane. Much stronger swimmer than they let on — made the 2km feel easy.',
    },
    // Luca rated Tom for golf
    {
      from: 'luca@bath.ac.uk', to: 'tom@bath.ac.uk', sport: 'golf', skill: 'intermediate',
      comment: 'Very composed and consistent around the greens. Gave helpful tips throughout — great person to learn the game with.',
    },
    // Ravi rated Zara for football
    {
      from: 'ravi@bath.ac.uk', to: 'zara@bath.ac.uk', sport: 'football', skill: 'intermediate',
      comment: 'Really quick off the mark and wins most of her headers. Gets a little impatient on the ball under pressure but the instincts are there.',
    },
    // James rated Zara for football
    {
      from: 'james@bath.ac.uk', to: 'zara@bath.ac.uk', sport: 'football', skill: 'intermediate',
      comment: 'Loads of energy and very competitive attitude. Good technical skills — much better than they let on beforehand.',
    },
  ]

  console.log('\n🌱 Seeding ratings…')
  for (const r of ratings) {
    await query(
      `INSERT OR IGNORE INTO ratings (from_user, to_user, sport, actual_skill, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [userIds[r.from], userIds[r.to], r.sport, r.skill, r.comment]
    ).catch(() => {})
    console.log(`  ✅ ${r.from} → ${r.to} [${r.sport} · ${r.skill}]`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Demo accounts (password: demo1234)')
  console.log('─────────────────────────────────────────')
  for (const u of users) {
    console.log(`  ${u.email.padEnd(28)} ${u.name}`)
  }
  process.exit(0)

}, 800)
