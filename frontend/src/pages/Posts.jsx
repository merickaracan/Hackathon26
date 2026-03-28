import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import SportFilter from '../components/SportFilter'
import PostCard from '../components/PostCard'
import { getPosts } from '../api/posts'
import { getRelationshipStatuses } from '../api/requests'

export default function Posts() {
  const { user } = useAuth()
  const [sport, setSport] = useState('')
  const [posts, setPosts] = useState([])
  const [sentPostIds, setSentPostIds] = useState(new Set())

  useEffect(() => {
    // Post-level request tracking is handled server-side; initialise empty
    getRelationshipStatuses().catch(() => {})
  }, [])

  useEffect(() => {
    getPosts(sport)
      .then(setPosts)
      .catch(() => setPosts([]))
  }, [sport])

  const visible = posts.filter(p => !sport || p.sport === sport)

  return (
    <div>
      <SportFilter active={sport} onChange={setSport} />
      <div className="flex flex-col gap-4 max-w-2xl">
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            initialRequestSent={sentPostIds.has(post.id)}
            isOwnPost={post.authorId != null && user?.id != null && Number(post.authorId) === Number(user.id)}
          />
        ))}
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
