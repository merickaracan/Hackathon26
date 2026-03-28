import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { sendRequest } from '../api/requests'

export default function PostCard({ post, initialRequestSent = false, isOwnPost = false }) {
  const { showToast } = useToast()
  const [requestSent, setRequestSent] = useState(initialRequestSent)
  const [loading, setLoading] = useState(false)

  const handleRequest = async () => {
    if (isOwnPost) return
    setLoading(true)
    try {
      await sendRequest({ postId: post.id })
      setRequestSent(true)
      showToast('Request sent.')
    } catch (err) {
      const msg = err?.response?.data?.error
      if (msg === 'Request already sent') setRequestSent(true)
      else showToast(msg || 'Failed to send request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-border flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-gold flex items-center justify-center bg-brand-tint text-brand text-xs font-bold flex-shrink-0 font-body">
            {post.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-main font-body">{post.author}</p>
            <p className="text-[11px] text-text-muted font-body">{post.timeAgo}</p>
          </div>
        </div>
        <span className="text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded bg-brand-tint text-brand font-body">
          {post.sport}
        </span>
      </div>

      <p className="text-sm text-text-muted leading-relaxed font-body">{post.desc}</p>

      <div>
        <div className="flex justify-between text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-1.5 font-body">
          <span>Skill level</span>
          <span>{post.skill}%</span>
        </div>
        <div className="h-0.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full" style={{ width: `${post.skill}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-text-muted font-body">{post.format}</span>
        {isOwnPost ? (
          <span className="text-[11px] text-text-muted font-body">Your session</span>
        ) : (
          <button
            onClick={handleRequest}
            disabled={requestSent || loading}
            className={`px-5 py-1.5 rounded-full border text-xs font-medium transition-colors font-body tracking-wide ${
              requestSent
                ? 'border-border text-text-muted cursor-default'
                : 'border-brand text-brand hover:bg-brand-tint disabled:opacity-50'
            }`}
          >
            {requestSent ? '✓ Request sent' : loading ? '…' : 'Send request'}
          </button>
        )}
      </div>
    </div>
  )
}
