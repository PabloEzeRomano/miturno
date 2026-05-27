'use client'
import { useState, useEffect, useCallback } from 'react'
import { NewAppointmentDrawer } from '@/components/admin/NewAppointmentDrawer'
import { AppointmentDrawer } from '@/components/admin/AppointmentDrawer'

type Appointment = {
  id: string
  clientName: string
  clientPhone: string
  clientEmail: string | null
  startsAt: string
  endsAt: string
  status: string
  service: { name: string; durationMins: number; price: number }
  recurringAppointmentId?: string | null
}

type Service = { id: string; name: string; durationMins: number; price: number }

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

function isWorkingDay(date: Date, availability: { dayOfWeek: number; isActive: boolean }[]): boolean {
  const dow = date.getDay()
  const avail = availability.find(a => a.dayOfWeek === dow)
  return avail ? avail.isActive : false
}

export function AgendaClient({ barberId, slug, shopName, services, availability }: { barberId: string; slug: string; shopName: string; services: Service[]; availability: { dayOfWeek: number; isActive: boolean }[] }) {
  const [view, setView] = useState<'week' | 'day'>('week')
  const [base, setBase] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formOpen, setFormOpen] = useState(false)

  const weekDates = getWeekDates(base)

  const load = useCallback(async () => {
    const fromBase = view === 'week' ? weekDates[0] : base
    const toBase = view === 'week' ? weekDates[6] : base
    const from = new Date(fromBase)
    from.setHours(0, 0, 0, 0)
    const to = new Date(toBase)
    to.setHours(23, 59, 59, 999)
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), ...(statusFilter !== 'all' && { status: statusFilter }) })
    const res = await fetch(`/api/appointments?${params}`)
    if (res.ok) setAppointments(await res.json())
  }, [view, base, statusFilter])

  useEffect(() => { load() }, [load])

  function copyLink() {
    navigator.clipboard.writeText(`${process.env.BASE_URL}${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openForm() {
    setFormOpen(true)
  }

  const displayDates = view === 'week'
    ? weekDates.filter(d => isWorkingDay(d, availability))
    : [base]

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-block">AGENDA</span>
          <h1 className="page-title">{shopName}</h1>
        </div>
        <div className="flex-wrap-sm">
          <button className="btn btn-gold btn-sm" onClick={openForm}>+ Nuevo turno</button>
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
      <div
        className={`cal-grid ${view === 'week' ? 'cal-grid--week' : 'cal-grid--day'}`}
        style={view === 'week' && displayDates.length !== 7 ? { gridTemplateColumns: `repeat(${displayDates.length}, 1fr)` } : undefined}
      >
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
                    <div className="appt-name">
                      {appt.clientName}
                      {appt.recurringAppointmentId && (
                        <span className="appt-recur-badge" title="Turno recurrente">↻</span>
                      )}
                    </div>
                    <div className="appt-meta">{fmtTime(appt.startsAt)} · {appt.service.name}</div>
                    <span className="appt-dot" style={{ background: STATUS_COLORS[appt.status] }} />
                  </button>
                ))}
                {dayAppts.length === 0 && (
                  <span className="cal-empty-hint">Sin turnos</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {appointments.length === 0 && displayDates.length > 0 && (
        <div className="agenda-empty-hint">
          <p>Compartí tu link para que los clientes reserven.</p>
          <button className="btn btn-outline btn-sm" onClick={copyLink}>{copied ? '¡Copiado!' : 'Copiar link público'}</button>
        </div>
      )}

      <NewAppointmentDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={load}
        barberId={barberId}
        slug={slug}
        services={services}
      />

      {
        drawerOpen && selected && (
          <AppointmentDrawer
        key={selected?.id}
        open={drawerOpen && !!selected}
        appointment={selected!}
        services={services}
        slug={slug}
        onClose={() => { setDrawerOpen(false); setSelected(null) }}
        onUpdated={() => { setDrawerOpen(false); setSelected(null); load() }}
      />
        )
      }
    </div>
  )
}


