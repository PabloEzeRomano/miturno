'use client'

import { useState, useEffect, useRef } from 'react'

interface Notif {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  new_booking: '📅',
  cancellation: '❌',
  reschedule: '🔄',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hs = Math.floor(mins / 60)
  if (hs < 24) return `hace ${hs} h`
  const days = Math.floor(hs / 24)
  return `hace ${days}d`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const poll = () =>
      fetch('/api/notifications?unread=1')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setUnread(d.count) })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (open) {
      setLoaded(false)
      fetch('/api/notifications')
        .then(r => r.ok ? r.json() : [])
        .then((data: Notif[]) => {
          setNotifs(data)
          setLoaded(true)
          setUnread(0)
          if (data.length > 0) {
            fetch('/api/notifications', { method: 'DELETE' }).catch(() => {})
          }
        })
        .catch(() => setLoaded(true))
    } else {
      setNotifs([])
      setLoaded(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="notif-bell-wrap">
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="Notificaciones"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Notificaciones</span>
          </div>

          <div className="notif-panel-body">
            {!loaded && <p className="notif-empty">Cargando…</p>}
            {loaded && notifs.length === 0 && (
              <p className="notif-empty">Sin notificaciones todavía.</p>
            )}
            {loaded && notifs.map((n, i) => (
              <div
                key={n.id}
                className="notif-item"
                style={{ borderTop: i > 0 ? '1px solid var(--c-line)' : 'none' }}
              >
                <span className="notif-icon">{TYPE_ICON[n.type] ?? '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="notif-msg">{n.message}</p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
