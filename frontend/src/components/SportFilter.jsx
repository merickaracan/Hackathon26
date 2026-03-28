const sports = [
  { value: '', label: 'All sports' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'padel', label: '🏓 Padel' },
  { value: 'badminton', label: '🏸 Badminton' },
  { value: 'squash', label: '🥎 Squash' },
  { value: 'running', label: '🏃 Running' },
]

export default function SportFilter({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sports.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === s.value
              ? 'bg-brand text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
