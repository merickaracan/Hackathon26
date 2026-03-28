import { useState } from 'react'
import PostGameModal from './PostGameModal'

const pageTitles = {
  '/discover': 'Discover',
  '/posts':    'Sessions',
  '/matches':  'Connections',
  '/profile':  'Profile',
}

const pageSubtitles = {
  '/discover': 'Find students near you who share your sport and schedule.',
  '/posts':    'Browse open sessions posted by students at your university.',
  '/matches':  'Your confirmed partners and pending requests.',
  '/profile':  'Your athletic identity on campus.',
}

export default function Topbar({ path }) {
  const [showModal, setShowModal] = useState(false)
  const title    = pageTitles[path]    || 'Sinder'
  const subtitle = pageSubtitles[path] || ''

  return (
    <>
      <header className="sticky top-0 z-20 bg-brand-bg border-b border-border px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-main">{title}</h1>
          {subtitle && <p className="text-xs text-text-muted mt-0.5 font-body">{subtitle}</p>}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand/90 transition-colors font-body tracking-wide"
        >
          Post a session
        </button>
      </header>
      {showModal && <PostGameModal onClose={() => setShowModal(false)} />}
    </>
  )
}
