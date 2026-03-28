import { useState, useEffect } from 'react'
import SportFilter from '../components/SportFilter'
import PostCard from '../components/PostCard'
import { getPosts } from '../api/posts'
import { getRelationshipStatuses } from '../api/requests'

const mockPosts = [
  { id: 1, author: 'Alex L.',  initials: 'AL', sport: 'tennis',    format: 'Singles',       timeAgo: '20 min ago', desc: 'Looking for a hitting partner this Sunday at 9am. Around 3.5–4.0 level. All standards welcome.',    skill: 68 },
  { id: 2, author: 'Maya T.', initials: 'MT', sport: 'padel',     format: 'Mixed doubles', timeAgo: '1 hr ago',   desc: 'Beginner padel player, just started last term. Looking for a relaxed partner — any level welcome.',   skill: 22 },
  { id: 3, author: 'Ravi B.', initials: 'RB', sport: 'football',  format: 'Group / open',  timeAgo: '3 hrs ago',  desc: 'Organising a 5-a-side at the Sports Centre on Saturday afternoon — need a few more players.',         skill: 48 },
]

export default function Posts() {
  const [sport, setSport] = useState('')
  const [posts, setPosts] = useState(mockPosts)
  const [sentPostIds, setSentPostIds] = useState(new Set())

  useEffect(() => {
    // Post-level request tracking is handled server-side; initialise empty
    getRelationshipStatuses().catch(() => {})
  }, [])

  useEffect(() => {
    getPosts(sport)
      .then(setPosts)
      .catch(() => setPosts(mockPosts))
  }, [sport])

  const visible = posts.filter(p => !sport || p.sport === sport)

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      <div className="flex flex-col gap-4 max-w-2xl">
        {visible.map((post) => <PostCard key={post.id} post={post} initialRequestSent={sentPostIds.has(post.id)} />)}
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
