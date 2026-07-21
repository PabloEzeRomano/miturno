'use client'

import { useState, useEffect } from 'react'

interface Notif {
  id: string
  type: 'new_booking' | 'cancellation' | 'reschedule'
  message: string
  read: boolean
  createdAt: string
  appointmentId: string | null
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
  return `hace ${days} día${days > 1 ? 's' : ''}`
}

export default function NotificacionesPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/notifications')
    if (res.ok) setNotifs(await res.json())
    setLoading(false)
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markOne(id: string) {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  useEffect(() => { load() }, [])

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="page-wrap--narrow">
      <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Notificaciones</h1>
        {unread > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading && <p className="field-hint">Cargando…</p>}

      {!loading && notifs.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--c-muted)' }}>
          Sin notificaciones todavía.
        </div>
      )}

      {!loading && notifs.length > 0 && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          {notifs.map((n, i) => (
            <div
              key={n.id}
              className={`notif-item${n.read ? '' : ' notif-item--unread'}`}
              style={{ borderTop: i > 0 ? '1px solid var(--c-line)' : 'none' }}
              onClick={() => !n.read && markOne(n.id)}
            >
              <span className="notif-icon">{TYPE_ICON[n.type] ?? '🔔'}</span>
              <span className="notif-msg">{n.message}</span>
              <span className="notif-time">{timeAgo(n.createdAt)}</span>
              {!n.read && <span className="notif-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
