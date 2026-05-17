'use client'
import { useState, useEffect, useCallback } from 'react'

type Appointment = {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string | null
  startsAt: string
  endsAt: string
  status: string
  service: { name: string; durationMins: number; price: number }
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'var(--c-gold)',
  completed: 'var(--c-success)',
  cancelled: 'var(--c-danger)',
}
const STATUS_BG: Record<string, string> = {
  confirmed: '#FAF3DD',
  completed: 'var(--c-success-bg)',
  cancelled: 'var(--c-danger-bg)',
}

function getWeekDates(base: Date): Date[] {
  const start = new Date(base)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function fmt(d: Date) {
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(s: string) {
  return new Date(s).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function AgendaClient({ barberId, slug, shopName }: { barberId: string; slug: string; shopName: string }) {
  const [view, setView] = useState<'week' | 'day'>('week')
  const [base, setBase] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const weekDates = getWeekDates(base)

  const load = useCallback(async () => {
    const from = view === 'week' ? weekDates[0].toISOString() : new Date(base.setHours(0, 0, 0, 0)).toISOString()
    const to = view === 'week' ? weekDates[6].toISOString() : new Date(base.setHours(23, 59, 59, 999)).toISOString()
    const params = new URLSearchParams({ from, to, ...(statusFilter !== 'all' && { status: statusFilter }) })
    const res = await fetch(`/api/appointments?${params}`)
    if (res.ok) setAppointments(await res.json())
  }, [view, base, statusFilter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setDrawerOpen(false)
    setSelected(null)
    load()
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://turnos.gemm-apps.com/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayDates = view === 'week' ? weekDates : [base]

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-block">AGENDA</span>
          <h1 className="page-title">{shopName}</h1>
        </div>
        <div className="flex-wrap-sm">
          <button className="btn btn-outline btn-sm" onClick={copyLink}>{copied ? '¡Copiado!' : 'Copiar link'}</button>
          <div className="view-toggle">
            {(['week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`view-btn${v === view ? ' view-btn--active' : ''}`}>
                {v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="filter-bar">
        {[['all', 'Todos'], ['confirmed', 'Confirmados'], ['completed', 'Completados'], ['cancelled', 'Cancelados']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)} className={`filter-btn${statusFilter === val ? ' filter-btn--active' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Date nav */}
      <div className="date-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(base); d.setDate(d.getDate() - (view === 'week' ? 7 : 1)); setBase(d) }}>
          ← {view === 'week' ? 'Semana anterior' : 'Día anterior'}
        </button>
        <span className="date-nav-label">
          {view === 'week' ? `${fmt(weekDates[0])} — ${fmt(weekDates[6])}` : base.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(base); d.setDate(d.getDate() + (view === 'week' ? 7 : 1)); setBase(d) }}>
          {view === 'week' ? 'Semana siguiente' : 'Día siguiente'} →
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setBase(new Date())}>Hoy</button>
      </div>

      {/* Calendar grid */}
      {appointments.length === 0 ? (
        <div className="agenda-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="agenda-empty-icon"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
          <p className="agenda-empty-title">Sin turnos en este período</p>
          <p className="agenda-empty-sub">Compartí tu link para que los clientes reserven.</p>
          <button className="btn btn-outline btn-sm" onClick={copyLink}>{copied ? '¡Copiado!' : 'Copiar link público'}</button>
        </div>
      ) : (
        <div className={`cal-grid ${view === 'week' ? 'cal-grid--week' : 'cal-grid--day'}`}>
          {displayDates.map(date => {
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.startsAt), date))
            const isToday = isSameDay(date, new Date())
            return (
              <div key={date.toISOString()} className="cal-col">
                <div className={`cal-col-hdr ${isToday ? 'cal-col-hdr--today' : 'cal-col-hdr--normal'}`}>
                  <span className={`cal-weekday${isToday ? ' cal-weekday--today' : ''}`}>
                    {date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase()}
                  </span>
                  <span className={`cal-date-num${isToday ? ' cal-date-num--today' : ''}`}>{date.getDate()}</span>
                </div>
                <div className="cal-appts">
                  {dayAppts.map(appt => (
                    <button key={appt.id} onClick={() => { setSelected(appt); setDrawerOpen(true) }}
                      className="appt-btn"
                      style={{ background: STATUS_BG[appt.status] || 'var(--c-bg-2)', borderLeftWidth: 3, borderLeftColor: STATUS_COLORS[appt.status] || 'var(--c-muted)', borderLeftStyle: 'solid' }}>
                      <div className="appt-name">{appt.clientName}</div>
                      <div className="appt-meta">{fmtTime(appt.startsAt)} · {appt.service.name}</div>
                      <span className="appt-dot" style={{ background: STATUS_COLORS[appt.status] }} />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && selected && (
        <>
          <div onClick={() => { setDrawerOpen(false); setSelected(null) }} className="drawer-overlay" />
          <div className="drawer">
            <div className="drawer-top">
              <div>
                <span className="eyebrow eyebrow-block">TURNO</span>
                <h2 className="drawer-h2">{selected.clientName}</h2>
              </div>
              <button onClick={() => { setDrawerOpen(false); setSelected(null) }} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="drawer-rows">
              <Row label="Servicio" value={selected.service.name} />
              <Row label="Hora" value={`${fmtTime(selected.startsAt)} — ${fmtTime(selected.endsAt)}`} mono />
              <Row label="Precio" value={`$${selected.service.price.toLocaleString('es-AR')}`} mono />
              <Row label="Teléfono" value={selected.clientPhone} mono />
              {selected.clientEmail && <Row label="Email" value={selected.clientEmail} />}
              <div>
                <span className="label">Estado</span>
                <span className={`badge badge-${selected.status}`}>{STATUS_LABELS[selected.status]}</span>
              </div>
            </div>

            <div className="drawer-actions">
              {selected.status !== 'completed' && (
                <button className="btn btn-primary" onClick={() => updateStatus(selected.id, 'completed')}>Marcar como completado</button>
              )}
              {selected.status !== 'cancelled' && (
                <button className="btn btn-outline btn-cancel-appt" onClick={() => updateStatus(selected.id, 'cancelled')}>Cancelar turno</button>
              )}
              {selected.status !== 'confirmed' && (
                <button className="btn btn-ghost" onClick={() => updateStatus(selected.id, 'confirmed')}>Reconfirmar</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="label">{label}</span>
      <span className={mono ? 'row-value row-value--mono' : 'row-value'}>{value}</span>
    </div>
  )
}
