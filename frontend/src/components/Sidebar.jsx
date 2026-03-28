import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/discover',     label: 'Discover' },
  { to: '/posts',        label: 'Sessions' },
  { to: '/requests',     label: 'Requests', badge: true },
  { to: '/post-session', label: 'Create session', highlight: true },
  { to: '/profile',      label: 'Profile' },
]

export default function Sidebar({ matchCount = 0 }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = profile?.name || user?.name || '—'
  const primarySport = profile?.sports?.[0]
  const initials = displayName !== '—' ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-brand-dark fixed left-0 top-0 z-30">
        <div className="px-7 py-8 border-b border-white/5">
          <span className="font-display text-3xl font-bold tracking-tight">
            <span className="text-brand">Sin</span>
            <span className="text-white">der</span>
          </span>
          <p className="text-[10px] tracking-widest uppercase text-white/30 mt-1 font-body">Where campus meets court</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-4 py-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors font-body ${
                  isActive
                    ? 'text-white bg-white/8 border-l-2 border-brand pl-[10px]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              <span>{item.label}</span>
              {item.badge && matchCount > 0 && (
                <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {matchCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Post session CTA */}
        <div className="px-4 pb-4">
          <Link
            to="/post-session"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-white text-sm font-semibold font-body hover:bg-brand/90 transition-colors tracking-wide"
          >
            <span className="text-base leading-none">+</span> Post session
          </Link>
        </div>

        <div className="px-5 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-white/30 text-[10px] truncate tracking-wide capitalize">
                {primarySport ? `${primarySport.sport} · ${primarySport.skill}` : '—'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-[10px] tracking-widest uppercase text-white/20 hover:text-brand transition-colors font-body"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark z-30 flex border-t border-white/5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-[11px] gap-0.5 font-body ${
                item.highlight
                  ? isActive ? 'text-brand font-semibold' : 'text-brand/70 font-semibold'
                  : isActive ? 'text-brand' : 'text-white/40'
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
