import { useState, useEffect } from 'react'
import { getRatablePlayers, submitRating, getGivenRatings, getReceivedRatings } from '../api/ratings'
import { getCompletedSessions } from '../api/posts'
import { useToast } from '../context/ToastContext'

const SKILLS = [
  { id: 'beginner',     label: 'Beginner',     desc: 'Still learning the basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Solid player, knows the game' },
  { id: 'advanced',     label: 'Advanced',     desc: 'Competitive, strong technique' },
]

const sportEmoji = {
  tennis: '🎾', padel: '🏓', football: '⚽', basketball: '🏀',
  running: '🏃', cycling: '🚴', swimming: '🏊', golf: '⛳',
}

const skillColor = { beginner: 'text-sky-600',  intermediate: 'text-amber-600', advanced: 'text-emerald-600' }
const skillBg    = { beginner: 'bg-sky-50 border-sky-200', intermediate: 'bg-amber-50 border-amber-200', advanced: 'bg-emerald-50 border-emerald-200' }

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatSessionDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function RateSession() {
  const { showToast } = useToast()
  const [given, setGiven]                   = useState([])
  const [received, setReceived]             = useState([])
  const [completedSessions, setCompleted]   = useState([])
  const [loading, setLoading]               = useState(true)

  // Rating modal state
  const [selected, setSelected]   = useState(null)   // { player, sessionSport }
  const [sport, setSport]         = useState('')
  const [skill, setSkill]         = useState('')
  const [comment, setComment]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () =>
    Promise.all([
      getGivenRatings(),
      getReceivedRatings(),
      getCompletedSessions(),
    ])
      .then(([gd, rd, cd]) => {
        setGiven(gd.ratings || [])
        setReceived(rd.ratings || [])
        setCompleted(Array.isArray(cd) ? cd : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  // Quick-lookup: `${toUser}_${sport}` → rating object
  const givenMap = {}
  given.forEach(r => { givenMap[`${r.to_user}_${r.sport}`] = r })

  // Sessions where at least one participant still needs rating
  const awaitingSessions = completedSessions.filter(s =>
    s.participants.some(p => !givenMap[`${p.id}_${s.sport}`])
  )

  // Sessions where every participant has been rated (or session had no other participants but user hosted)
  const ratedSessions = completedSessions.filter(s =>
    s.participants.length === 0 ||
    s.participants.every(p => givenMap[`${p.id}_${s.sport}`])
  )

  function openRating(player, sessionSport) {
    setSelected({ player, sessionSport })
    setSport(sessionSport)
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
      await submitRating(selected.player.id, sport, skill, comment)
      await load()
      showToast('Rating submitted!')
      closeRating()
    } catch (err) {
      showToast(err.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted font-body text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-10">

      {/* ══ AWAITING RATINGS ═════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold text-text-main tracking-tight">Awaiting ratings</h1>
          <p className="text-text-muted text-sm font-body mt-1">Past sessions where you still need to rate a participant.</p>
        </div>

        {awaitingSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-semibold text-text-main font-body">All caught up</p>
            <p className="text-xs text-text-muted font-body mt-1">You've rated everyone from your recent sessions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {awaitingSessions.map(s => {
              const unrated = s.participants.filter(p => !givenMap[`${p.id}_${s.sport}`])
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  {/* Session header */}
                  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sportEmoji[s.sport] || '🏅'}</span>
                      <div>
                        <p className="font-semibold text-text-main text-sm font-body capitalize">
                          {s.sport} · {s.format}
                        </p>
                        <p className="text-xs text-text-muted font-body mt-0.5">📍 {s.location}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-text-muted font-body whitespace-nowrap pt-0.5">
                      {formatSessionDate(s.datetime)}
                    </span>
                  </div>
                  {/* Unrated participants */}
                  <div className="divide-y divide-border">
                    {unrated.map(p => (
                      <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="w-9 h-9 rounded-full bg-brand-tint flex items-center justify-center text-brand text-xs font-semibold flex-shrink-0 font-body">
                          {initials(p.name)}
                        </div>
                        <p className="flex-1 text-sm font-semibold text-text-main font-body">{p.name}</p>
                        <button
                          onClick={() => openRating(p, s.sport)}
                          className="text-xs font-semibold font-body px-4 py-1.5 rounded-full border border-brand text-brand hover:bg-brand-tint transition-colors flex-shrink-0"
                        >
                          Rate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ══ ALREADY RATED ════════════════════════════════════════════════════ */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-text-main tracking-tight">Already rated</h2>
          <p className="text-text-muted text-sm font-body mt-1">Sessions you've rated — and reviews others left for you.</p>
        </div>

        {ratedSessions.length === 0 && received.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-semibold text-text-main font-body">No ratings yet</p>
            <p className="text-xs text-text-muted font-body mt-1">Completed sessions and their reviews will show here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Sessions you've rated */}
            {ratedSessions.map(s => {
              const rated = s.participants.filter(p => givenMap[`${p.id}_${s.sport}`])
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  {/* Session header */}
                  <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sportEmoji[s.sport] || '🏅'}</span>
                      <div>
                        <p className="font-semibold text-text-main text-sm font-body capitalize">
                          {s.sport} · {s.format}
                        </p>
                        <p className="text-xs text-text-muted font-body mt-0.5">📍 {s.location}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-text-muted font-body whitespace-nowrap pt-0.5">
                      {formatSessionDate(s.datetime)}
                    </span>
                  </div>
                  {/* Ratings given */}
                  <div className="divide-y divide-border">
                    {rated.length === 0 && (
                      <p className="px-5 py-3 text-xs text-text-muted font-body">No other participants.</p>
                    )}
                    {rated.map(p => {
                      const r = givenMap[`${p.id}_${s.sport}`]
                      return (
                        <div key={p.id} className="px-5 py-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-brand-tint flex items-center justify-center text-brand text-xs font-semibold flex-shrink-0 font-body">
                                {initials(p.name)}
                              </div>
                              <p className="text-sm font-semibold text-text-main font-body">{p.name}</p>
                            </div>
                            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold font-body capitalize flex-shrink-0 ${skillBg[r.actual_skill]} ${skillColor[r.actual_skill]}`}>
                              {r.actual_skill}
                            </span>
                          </div>
                          {r.comment && (
                            <p className="text-xs text-text-muted font-body leading-relaxed italic ml-12">
                              "{r.comment}"
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Reviews received */}
            {received.length > 0 && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <p className="font-semibold text-text-main text-sm font-body">Reviews received</p>
                  <p className="text-xs text-text-muted font-body mt-0.5">What others said about playing with you.</p>
                </div>
                <div className="divide-y divide-border">
                  {received.map((r, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-tint flex items-center justify-center text-brand text-xs font-semibold flex-shrink-0 font-body">
                            {initials(r.from_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-main font-body">{r.from_name}</p>
                            <p className="text-xs text-text-muted font-body capitalize">{sportEmoji[r.sport] || '🏅'} {r.sport}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold font-body capitalize flex-shrink-0 ${skillBg[r.actual_skill]} ${skillColor[r.actual_skill]}`}>
                          {r.actual_skill}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-text-muted font-body leading-relaxed italic ml-12">
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* ══ RATING MODAL ═════════════════════════════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-border shadow-xl w-full max-w-md p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-brand-tint flex items-center justify-center text-brand text-sm font-semibold">
                {initials(selected.player.name)}
              </div>
              <div>
                <p className="text-text-main font-semibold text-sm font-body">{selected.player.name}</p>
                <p className="text-text-muted text-xs font-body capitalize">
                  {sportEmoji[selected.sessionSport] || '🏅'} {selected.sessionSport} — how did they actually play?
                </p>
              </div>
            </div>

            {/* Skill level */}
            <div className="mb-4">
              <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body mb-2">Actual level</p>
              <div className="flex flex-col gap-2">
                {SKILLS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSkill(s.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-colors font-body ${
                      skill === s.id ? 'border-brand bg-brand-tint' : 'border-border hover:border-brand'
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
              <p className="text-[10px] tracking-widest uppercase font-semibold text-text-muted font-body mb-2">
                Note <span className="normal-case tracking-normal font-normal">(optional)</span>
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="e.g. Great footwork, maybe overestimates serve speed…"
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
                disabled={!skill || submitting}
                className="flex-[2] py-2.5 rounded-full bg-brand text-white text-sm font-semibold font-body hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-default"
              >
                {submitting ? 'Submitting…' : 'Submit rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
