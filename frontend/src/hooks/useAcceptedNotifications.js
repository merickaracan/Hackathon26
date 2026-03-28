import { useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { getRelationships } from '../api/requests'

const STORAGE_KEY = 'sinder_pending_sent'

// Persists { [otherUserId]: name } for every pending-sent request.
// On each call, compares against current accepted relationships and toasts for any
// that transitioned from pending → accepted since the last check.
export function useAcceptedNotifications(isLoggedIn) {
  const { showToast } = useToast()

  useEffect(() => {
    if (!isLoggedIn) return

    const check = async () => {
      try {
        const { relationships } = await getRelationships()

        // Load what we had stored as pending-sent
        let stored = {}
        try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch {}

        // Build updated pending-sent map from current data
        const nowPending = {}
        const nowAccepted = new Set()

        for (const r of relationships) {
          if (r.direction === 'sent' && r.status === 'pending') {
            nowPending[r.other_user_id] = r.other_user_name
          }
          if (r.direction === 'sent' && r.status === 'accepted') {
            nowAccepted.add(r.other_user_id)
          }
        }

        // Any player that was in stored pending AND is now accepted → notify
        for (const [userId, name] of Object.entries(stored)) {
          if (nowAccepted.has(Number(userId)) || nowAccepted.has(String(userId))) {
            showToast(`🎉 ${name} accepted your match request!`)
          }
        }

        // Persist only current pending-sent entries for next check
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nowPending))
      } catch {
        // silently fail — notifications are non-critical
      }
    }

    check()
  }, [isLoggedIn]) // runs once per mount (i.e. every page navigation inside the app)
}
