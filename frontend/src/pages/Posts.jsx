import { useState, useEffect } from 'react'
import SportFilter from '../components/SportFilter'
import PostCard from '../components/PostCard'
import api from '../api/axios'

const mockPosts = [
  { id: 1, author: 'Alex L.',  initials: 'AL', sport: 'tennis',    format: 'Singles',       timeAgo: '20 min ago', desc: 'Looking for a hitting partner this Sunday at 9am. Around 3.5–4.0 level. All standards welcome.',    skill: 68 },
  { id: 2, author: 'Maya T.', initials: 'MT', sport: 'padel',     format: 'Mixed doubles', timeAgo: '1 hr ago',   desc: 'Beginner padel player, just started last term. Looking for a relaxed partner — any level welcome.',   skill: 22 },
  { id: 3, author: 'Ravi B.', initials: 'RB', sport: 'badminton', format: 'Doubles',        timeAgo: '3 hrs ago',  desc: 'Got a doubles court booked at the Sports Centre on Saturday afternoon — need one more player.',      skill: 48 },
]

export default function Posts() {
  const [sport, setSport] = useState('')
  const [posts, setPosts] = useState(mockPosts)

  useEffect(() => {
    api.get('/api/posts', { params: { sport } })
      .then((res) => setPosts(res.data))
      .catch(() => setPosts(mockPosts))
  }, [sport])

  const visible = posts.filter(p => !sport || p.sport === sport)

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      <div className="flex flex-col gap-4 max-w-2xl">
        {visible.map((post) => <PostCard key={post.id} post={post} />)}
        {visible.length === 0 && (
          <div className="text-center py-24 text-text-muted">
            <p className="font-display text-4xl font-semibold text-text-main mb-2">No sessions yet</p>
            <p className="text-sm font-body">Be the first to post a session.</p>
          </div>
        )}
      </div>
    </div>
  )
}
