const sports = [
  { value: '',           label: 'All Sports' },
  { value: 'tennis',     label: 'Tennis' },
  { value: 'padel',      label: 'Padel' },
  { value: 'football',   label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'running',    label: 'Running' },
  { value: 'cycling',    label: 'Cycling' },
  { value: 'swimming',   label: 'Swimming' },
  { value: 'golf',       label: 'Golf' },
]

export default function SportFilter({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {sports.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all font-body ${
            active === s.value
              ? 'border border-gold text-brand bg-brand-tint'
              : 'border border-border text-text-muted bg-white hover:border-gold hover:text-brand'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
