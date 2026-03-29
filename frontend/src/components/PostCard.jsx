import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { sendRequest } from '../api/requests'

const sportColors = {
  tennis:     'bg-emerald-100 text-emerald-700',
  padel:      'bg-cyan-100 text-cyan-700',
  football:   'bg-green-100 text-green-700',
  basketball: 'bg-orange-100 text-orange-700',
  running:    'bg-rose-100 text-rose-700',
  cycling:    'bg-lime-100 text-lime-700',
  swimming:   'bg-sky-100 text-sky-700',
  golf:       'bg-teal-100 text-teal-700',
}

export default function PostCard({ post, initialRequestSent = false, isOwnPost = false }) {
  const { showToast } = useToast()
  const [requestSent, setRequestSent] = useState(initialRequestSent)
  const [loading, setLoading] = useState(false)
  const [spotsLeft, setSpotsLeft] = useState(post.spotsLeft ?? post.spots ?? 2)

  const handleRequest = async () => {
    if (isOwnPost) return
    setLoading(true)
    try {
      await sendRequest({ postId: post.id })
      setRequestSent(true)
      setSpotsLeft(prev => Math.max(0, prev - 1))
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
            <Link to={`/players/${post.authorId}`} className="text-sm font-semibold text-text-main font-body hover:text-brand transition-colors">
              {post.author}
            </Link>
            <p className="text-[11px] text-text-muted font-body">{post.timeAgo}</p>
          </div>
        </div>
        <span className={`text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded font-body ${sportColors[post.sport] || 'bg-brand-tint text-brand'}`}>
          {post.sport}
        </span>
      </div>

      <p className="text-sm text-text-muted leading-relaxed font-body">{post.desc}</p>

      <div>
        <div className="text-[10px] tracking-widest uppercase font-semibold text-text-muted mb-1.5 font-body">
          Skill level
        </div>
        <div className="h-0.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full" style={{ width: `${post.skill}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted font-body">{post.format}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-body ${spotsLeft === 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            {spotsLeft === 0 ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </span>
        </div>
        {isOwnPost ? (
          <span className="text-[11px] text-text-muted font-body">Your session</span>
        ) : (
          <button
            onClick={handleRequest}
            disabled={requestSent || loading || spotsLeft === 0}
            className={`px-5 py-1.5 rounded-full border text-xs font-medium transition-colors font-body tracking-wide ${
              requestSent
                ? 'border-border text-text-muted cursor-default'
                : spotsLeft === 0
                ? 'border-border text-text-muted cursor-not-allowed opacity-50'
                : 'border-brand text-brand hover:bg-brand-tint disabled:opacity-50'
            }`}
          >
            {requestSent ? '✓ Request sent' : loading ? '…' : spotsLeft === 0 ? 'Full' : 'Send request'}
          </button>
        )}
      </div>
    </div>
  )
}
