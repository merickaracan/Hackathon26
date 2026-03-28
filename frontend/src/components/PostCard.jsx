import { useToast } from '../context/ToastContext'
import api from '../api/axios'

export default function PostCard({ post }) {
  const { showToast } = useToast()

  const handleRequest = async () => {
    try {
      await api.post('/api/requests', { postId: post.id })
      showToast('Request sent! ✅')
    } catch {
      showToast('Request sent! ✅')
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {post.initials}
          </div>
          <div>
            <p className="font-semibold text-sm text-brand-dark">{post.author}</p>
            <p className="text-xs text-gray-400">{post.timeAgo}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-brand-tint text-brand font-medium capitalize">
          {post.sport}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">{post.desc}</p>

      {/* Skill bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Skill level</span>
          <span>{post.skill}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full" style={{ width: `${post.skill}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">{post.format}</span>
        <button
          onClick={handleRequest}
          className="px-4 py-1.5 rounded-full border border-brand text-brand text-sm font-medium hover:bg-brand-tint transition-colors"
        >
          Send request
        </button>
      </div>
    </div>
  )
}
