'use client'
import { useState, useEffect } from 'react'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function parseDMY(s: string): string {
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

type ScheduleItem = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }
type BlockedDate = { id: string; date: string; endDate: string | null; reason: string | null }

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    [1, 2, 3, 4, 5, 6, 0].map(d => ({ dayOfWeek: d, startTime: '09:00', endTime: '19:00', isActive: d !== 0 }))
  )
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newDate, setNewDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/availability').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setSchedule([1, 2, 3, 4, 5, 6, 0].map(d => {
          const found = data.find((a: ScheduleItem) => a.dayOfWeek === d)
          return found || { dayOfWeek: d, startTime: '09:00', endTime: '19:00', isActive: false }
        }))
      }
    })
    loadBlocked()
  }, [])

  async function loadBlocked() {
    const res = await fetch('/api/blocked-dates')
    if (res.ok) setBlockedDates(await res.json())
  }

  function updateDay(dayOfWeek: number, field: string, value: unknown) {
    setSchedule(s => s.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
  }

  async function saveSchedule() {
    setSaving(true)
    await fetch('/api/availability', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schedule }) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addBlockedDate() {
    const parsed = parseDMY(newDate)
    if (!parsed) return
    const parsedEnd = newEndDate ? parseDMY(newEndDate) : ''
    if (newEndDate && !parsedEnd) return
    if (parsedEnd && parsedEnd < parsed) return
    await fetch('/api/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: parsed, endDate: parsedEnd || null, reason: newReason || null }),
    })
    setNewDate('')
    setNewEndDate('')
    setNewReason('')
    loadBlocked()
  }

  async function removeBlocked(id: string) {
    await fetch(`/api/blocked-dates/${id}`, { method: 'DELETE' })
    loadBlocked()
  }

  return (
    <div className="page-wrap--mid">
      <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
      <h1 className="page-title page-title--mb">Disponibilidad</h1>

      {/* Weekly schedule */}
      <div className="panel panel--mb-sm">
        <h2 className="section-title">Horario semanal</h2>
        <div className="sched-col">
          {schedule.map(({ dayOfWeek, startTime, endTime, isActive }) => (
            <div key={dayOfWeek} className="sched-row">
              <label className="toggle toggle--noflex">
                <input type="checkbox" checked={isActive} onChange={e => updateDay(dayOfWeek, 'isActive', e.target.checked)} />
                <span className="toggle-track" />
              </label>
              <span className="sched-day-label" style={{ fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--c-ink)' : 'var(--c-muted)' }}>{DAYS[dayOfWeek]}</span>
              {isActive && (
                <>
                  <input type="time" value={startTime} onChange={e => updateDay(dayOfWeek, 'startTime', e.target.value)} className="input input-time" />
                  <span className="sched-sep">hasta</span>
                  <input type="time" value={endTime} onChange={e => updateDay(dayOfWeek, 'endTime', e.target.value)} className="input input-time" />
                </>
              )}
              {!isActive && <span className="sched-closed">Cerrado</span>}
            </div>
          ))}
        </div>
        <div className="mt-24">
          <button className="btn btn-primary" onClick={saveSchedule} disabled={saving}>
            {saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar horario'}
          </button>
        </div>
      </div>

      {/* Blocked dates */}
      <div className="panel">
        <h2 className="section-title">Fechas bloqueadas</h2>

        <div className="form-row mb-20">
          <div className="form-col-1">
            <label className="label">Desde</label>
            <input type="text" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} placeholder="dd/mm/aaaa" inputMode="numeric" />
          </div>
          <div className="form-col-1">
            <label className="label">Hasta <span className="text-muted" style={{ fontWeight: 400 }}>(opcional)</span></label>
            <input type="text" className="input" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} placeholder="dd/mm/aaaa" inputMode="numeric" />
          </div>
          <div className="form-col-1">
            <label className="label">Motivo (opcional)</label>
            <input className="input" value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Vacaciones, feriado…" />
          </div>
          <div className="flex-end">
            <button className="btn btn-outline" onClick={addBlockedDate}>Bloquear fecha</button>
          </div>
        </div>

        {blockedDates.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 14 }}>No hay fechas bloqueadas.</p>
        ) : (
          <div className="stack-sm">
            {blockedDates.map(bd => {
              const fmt = (d: Date) =>
                `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
              const start = new Date(bd.date)
              let display = fmt(start)
              if (bd.endDate) {
                const end = new Date(bd.endDate)
                display = `${fmt(start)} → ${fmt(end)}`
              }
              return (
                <div key={bd.id} className="blocked-row">
                  <div>
                    <span className="blocked-date">{display}</span>
                    {bd.reason && <span className="blocked-reason">{bd.reason}</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm btn-danger" onClick={() => removeBlocked(bd.id)}>Quitar</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
