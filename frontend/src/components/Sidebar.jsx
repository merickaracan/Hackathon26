import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/discover', label: 'Discover', icon: '🔍' },
  { to: '/posts', label: 'Open Posts', icon: '📋' },
  { to: '/matches', label: 'Matches', icon: '💬', badge: true },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

const mockUser = { name: 'You', sport: 'Tennis', skill: 'Intermediate' }

export default function Sidebar({ matchCount = 0 }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-brand-dark fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="px-6 py-6">
          <span className="font-display text-2xl font-bold">
            <span className="text-brand">Sin</span>
            <span className="text-white">der</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white border-l-2 border-brand bg-brand/10 pl-[10px]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && matchCount > 0 && (
                <span className="ml-auto bg-brand text-white text-xs px-1.5 py-0.5 rounded-full">
                  {matchCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-5 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {mockUser.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{mockUser.name}</p>
            <p className="text-gray-400 text-xs truncate">{mockUser.sport} · {mockUser.skill}</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark z-30 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-xs gap-1 ${
                isActive ? 'text-brand' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && matchCount > 0 && (
              <span className="absolute top-1 bg-brand text-white text-xs px-1 rounded-full">
                {matchCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
