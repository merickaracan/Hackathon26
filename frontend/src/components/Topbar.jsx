import { useState } from 'react'
import PostGameModal from './PostGameModal'

const pageTitles = {
  '/discover': 'Discover',
  '/posts': 'Open Posts',
  '/matches': 'Matches',
  '/profile': 'Profile',
}

export default function Topbar({ path }) {
  const [showModal, setShowModal] = useState(false)
  const title = pageTitles[path] || 'Sinder'

  return (
    <>
      <header className="sticky top-0 z-20 bg-brand-bg border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-brand-dark">{title}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          + Post a game
        </button>
      </header>
      {showModal && <PostGameModal onClose={() => setShowModal(false)} />}
    </>
  )
}
