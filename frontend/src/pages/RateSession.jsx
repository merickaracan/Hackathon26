import { useState, useEffect } from 'react'
import { getRatablePlayers, submitRating, getGivenRatings } from '../api/ratings'
import { useToast } from '../context/ToastContext'

const SKILLS = [
  { id: 'beginner',     label: 'Beginner',     desc: 'Still learning the basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Solid player, knows the game' },
  { id: 'advanced',     label: 'Advanced',     desc: 'Competitive, strong technique' },
]

const sportEmoji = {
  tennis: '🎾', padel: '🏓', football: '⚽', basketball: '🏀',
  running: '🏃', cycling: '🚴', swimming: '🏊', golf: '⛳',
  volleyball: '🏐', badminton: '🏸',
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function RateSession() {
  const { showToast } = useToast()
  const [players, setPlayers]       = useState([])
  const [given, setGiven]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)   // player being rated
  const [sport, setSport]           = useState('')
  const [skill, setSkill]           = useState('')
  const [comment, setComment]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getRatablePlayers(), getGivenRatings()])
      .then(([pd, gd]) => {
        setPlayers(pd.players || [])
        setGiven(gd.ratings || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function openRating(player) {
    setSelected(player)
    setSport(player.sports?.[0]?.sport || '')
    setSkill('')
    setComment('')
  }

  function closeRating() {
    setSelected(null)
    setSport('')
    setSkill('')
    setComment('')
  }

  async function handleSubmit() {
    if (!sport || !skill) return
    setSubmitting(true)
    try {
      await submitRating(selected.id, sport, skill, comment)
      // Refresh given ratings
      const gd = await getGivenRatings()
      setGiven(gd.ratings || [])
      showToast('Rating submitted!', 'success')
      closeRating()
    } catch (err) {
      showToast(err.message || 'Failed to submit rating', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Map "given" ratings for quick lookup: `${toUser}_${sport}` → actualSkill
  const givenMap = {}
  given.forEach(r => { givenMap[`${r.to_user}_${r.sport}`] = r.actual_skill })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted font-body text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text-main tracking-tight">Rate a session</h1>
        <p className="text-text-muted text-sm font-body mt-1">
          Give feedback on how your connections actually played — helps keep skill levels accurate.
        </p>
      </div>

      {players.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <p className="text-text-muted font-body text-sm">You haven't connected with anyone yet.</p>
          <p className="text-text-muted font-body text-xs mt-1">Head to Discover to find players and send a match request.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {players.map(player => {
            const sports = player.sports || []
            return (
              <div
                key={player.id}
                className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center text-brand text-sm font-semibold flex-shrink-0">
                    {initials(player.name)}
                  </div>
                  <div>
                    <p className="text-text-main font-semibold text-sm font-body">{player.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {sports.map(s => {
                        const rated = givenMap[`${player.id}_${s.sport}`]
                        return (
                          <span
                            key={s.sport}
                            className="text-[11px] px-2 py-0.5 rounded-full border border-border font-body"
                            style={{ color: rated ? '#6E9E87' : undefined }}
                          >
                            {sportEmoji[s.sport] || '🏅'} {s.sport}
                            {rated && <span className="ml-1 opacity-70">· {rated}</span>}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openRating(player)}
                  className="flex-shrink-0 text-xs font-semibold font-body px-4 py-2 rounded-full border border-brand text-brand hover:bg-brand-tint transition-colors"
                >
                  Rate
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Rating modal */}
      {selected && (
        <div className="fixed inset-0 bg-espresso/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-md p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center text-brand text-sm font-semibold">
                {initials(selected.name)}
              </div>
              <div>
                <p className="text-text-main font-semibold text-sm font-body">{selected.name}</p>
                <p className="text-text-muted text-xs font-body">How did they actually play?</p>
              </div>
            </div>

            {/* Sport picker */}
            {selected.sports?.length > 1 && (
              <div className="mb-4">
                <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body mb-2">Sport</p>
                <div className="flex flex-wrap gap-2">
                  {selected.sports.map(s => (
                    <button
                      key={s.sport}
                      onClick={() => setSport(s.sport)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-body transition-colors ${
                        sport === s.sport
                          ? 'border-brand bg-brand-tint text-brand font-semibold'
                          : 'border-border text-text-muted hover:border-brand hover:text-brand'
                      }`}
                    >
                      {sportEmoji[s.sport] || '🏅'} {s.sport}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skill level */}
            <div className="mb-4">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body mb-2">Actual level</p>
              <div className="flex flex-col gap-2">
                {SKILLS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSkill(s.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors font-body ${
                      skill === s.id
                        ? 'border-brand bg-brand-tint'
                        : 'border-border hover:border-brand'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${skill === s.id ? 'text-brand' : 'text-text-main'}`}>{s.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-5">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body mb-2">Note <span className="normal-case tracking-normal font-normal">(optional)</span></p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="e.g. Great footwork, maybe overestimates serve speed..."
                rows={2}
                className="w-full text-sm border border-border rounded-xl px-4 py-2.5 font-body text-text-main placeholder-text-muted focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRating}
                className="flex-1 py-2.5 rounded-full border border-border text-text-muted text-sm font-body hover:border-brand hover:text-brand transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!sport || !skill || submitting}
                className="flex-2 flex-grow-[2] py-2.5 rounded-full bg-brand text-white text-sm font-semibold font-body hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-default"
              >
                {submitting ? 'Submitting...' : 'Submit rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
