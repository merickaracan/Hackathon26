const pageTitles = {
  '/discover':     'Discover',
  '/posts':        'Sessions',
  '/matches':      'Connections',
  '/profile':      'Profile',
  '/post-session': 'Create session',
}

const pageSubtitles = {
  '/discover':     'Find students near you who share your sport and schedule.',
  '/posts':        'Browse open sessions posted by students at your university.',
  '/matches':      'Your confirmed partners and pending requests.',
  '/profile':      'Your athletic identity on campus.',
  '/post-session': 'Let other players near you know you\'re looking to play.',
}

export default function Topbar({ path }) {
  const title    = pageTitles[path]    || 'Sinder'
  const subtitle = pageSubtitles[path] || ''

  return (
    <header className="sticky top-0 z-20 bg-brand-bg border-b border-border px-6 md:px-10 py-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-main">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted mt-0.5 font-body">{subtitle}</p>}
      </div>
    </header>
  )
}
