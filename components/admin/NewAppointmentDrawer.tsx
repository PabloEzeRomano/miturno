'use client'
import { useState, useRef } from 'react'
import { useAvailableSlots, calcEndTime } from './useAvailableSlots'
import { ServiceSlotPicker } from './ServiceSlotPicker'

type Service = { id: string; name: string; durationMins: number; price: number }
type User = { id: string; name: string; role: string }

const DAY_LABELS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className="section-head">
      <span className="section-num">{num}</span>
      <span className="section-lbl">{label}</span>
    </div>
  )
}

function nextAvailableDay(availability: { dayOfWeek: number; isActive: boolean }[]): string {
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dow = d.getDay()
    if (availability.find(a => a.dayOfWeek === dow)?.isActive) {
      return d.toISOString().split('T')[0]
    }
  }
  return new Date().toISOString().split('T')[0]
}

export function NewAppointmentDrawer({
  open,
  onClose,
  onCreated,
  establishmentId,
  slug,
  services,
  availability,
  users,
  role,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  establishmentId: string
  slug: string
  services: Service[]
  availability: { dayOfWeek: number; isActive: boolean }[]
  users: User[]
  role: string
}) {
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })
  const [selUserId, setSelUserId] = useState('')
  const [selServiceId, setSelServiceId] = useState('')
  const [selDate, setSelDate] = useState('')
  const [selSlot, setSelSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurFrequency, setRecurFrequency] = useState<'weekly' | 'biweekly'>('weekly')
  const [recurEndDate, setRecurEndDate] = useState('')

  const isOwner = role === 'Owner'
  const showUserSelector = isOwner && users.length > 1
  const nextSectionNum = showUserSelector ? '02' : '01'
  const nextNum = showUserSelector ? 2 : 1

  const selService = services.find(s => s.id === selServiceId)
  const { slots } = useAvailableSlots(slug, selDate, selServiceId, open, undefined, selUserId)
  const endTime = selSlot && selService ? calcEndTime(selSlot, selService.durationMins) : ''

  const prevOpen = useRef(open)
  if (open && !prevOpen.current) {
    setClientForm({ name: '', phone: '', email: '' })
    setSelUserId(isOwner ? (users.length === 1 ? users[0].id : '') : (users[0]?.id || ''))
    setSelServiceId('')
    setSelDate(nextAvailableDay(availability))
    setSelSlot('')
    setIsRecurring(false)
    setRecurFrequency('weekly')
    setRecurEndDate('')
    setSubmitError('')
  }
  prevOpen.current = open

  async function submitAppointment() {
    if (!clientForm.name || !clientForm.phone || !selServiceId || !selDate || !selSlot) return
    if (showUserSelector && !selUserId) return
    setSubmitting(true)
    setSubmitError('')

    const effectiveUserId = selUserId || (users.length === 1 ? users[0].id : '')

    try {
      if (isRecurring) {
        const parsedDate = new Date(selDate + 'T12:00:00')
        const dayOfWeek = parsedDate.getDay()
        const res = await fetch('/api/recurring-appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selServiceId,
            clientName: clientForm.name,
            clientPhone: clientForm.phone,
            clientEmail: clientForm.email || null,
            frequency: recurFrequency,
            dayOfWeek,
            time: selSlot,
            startDate: selDate,
            endDate: recurEndDate || null,
            userId: effectiveUserId || undefined,
          }),
        })
        if (res.ok) {
          onClose()
          onCreated()
        } else {
          setSubmitError('Error al crear el turno recurrente. Intentá de nuevo.')
        }
      } else {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId,
            serviceId: selServiceId,
            clientName: clientForm.name,
            clientPhone: clientForm.phone,
            clientEmail: clientForm.email || null,
            date: selDate,
            time: selSlot,
            userId: effectiveUserId || undefined,
          }),
        })
        if (res.ok) {
          onClose()
          onCreated()
        } else {
          setSubmitError('Error al crear el turno. Intentá de nuevo.')
        }
      }
    } catch {
      setSubmitError('Error al crear el turno. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = !!(clientForm.name && clientForm.phone && selServiceId && selDate && selSlot && !submitting && (!showUserSelector || selUserId))

  const slotLabel = selDate && selSlot && selService
    ? (() => {
        const d = new Date(selDate + 'T12:00:00')
        const dow = d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
        const day = d.getDate()
        const extra = isRecurring
          ? ` · recurrente ${recurFrequency === 'weekly' ? 'semanal' : 'cada 2 semanas'}`
          : ''
        const barber = showUserSelector && selUserId ? ` · ${users.find(u => u.id === selUserId)?.name}` : ''
        return `${dow} ${day} · ${selSlot} — ${endTime}${extra}${barber}`
      })()
    : ''

  if (!open) return null

  const selDayOfWeek = selDate
    ? new Date(selDate + 'T12:00:00').getDay()
    : -1

  return (
    <div className="drawer-shell">
      <div className="dim-soft" onClick={onClose} />
      <div className="drawer drawer--form">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Agenda · Nuevo</span>
            <h3 className="drawer-title">Turno <em>manual</em></h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          <div className="form-stack">
            {showUserSelector && (
              <>
                <div>
                  <SectionHead num="01" label="Profesional" />
                  <div className="field">
                    <label className="field-label">Barbero / Profesional</label>
                    <select className="select" value={selUserId} onChange={e => { setSelUserId(e.target.value); setSelSlot('') }}>
                      <option value="">Seleccionar profesional</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="divider" />
              </>
            )}

            <div>
              <SectionHead num={nextSectionNum} label="Cliente" />
              <div className="field">
                <label className="field-label">Nombre</label>
                <input className="input" value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre completo" />
              </div>
              <div className="field-row" style={{ marginTop: 10 }}>
                <div className="field">
                  <label className="field-label">Teléfono</label>
                  <input className="input" type="tel" value={clientForm.phone} onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 9 11 1234-5678" />
                </div>
                <div className="field">
                  <label className="field-label">Email · opcional</label>
                  <input className="input" type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
                </div>
              </div>
            </div>

            <div className="divider" />

            <div>
              <SectionHead num={String(nextNum + 1)} label="Servicio y horario" />
              <ServiceSlotPicker
                services={services}
                slug={slug}
                serviceId={selServiceId}
                date={selDate}
                slot={selSlot}
                onServiceChange={setSelServiceId}
                onDateChange={setSelDate}
                onSlotChange={setSelSlot}
                enabled={open}
                userId={selUserId}
              />
            </div>

            <div className="divider" />

            <div>
              <SectionHead num={String(nextNum + 2)} label="Repetición" />
              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                    <span className="toggle-track" />
                  </label>
                  <span style={{ fontSize: 14, color: 'var(--c-ink)' }}>Turno recurrente</span>
                </div>
              </div>

              {isRecurring && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field">
                    <label className="field-label">Frecuencia</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className={`btn btn-sm ${recurFrequency === 'weekly' ? 'btn-gold' : 'btn-outline'}`}
                        onClick={() => setRecurFrequency('weekly')}
                        style={{ flex: 1 }}
                      >
                        Semanal
                      </button>
                      <button
                        className={`btn btn-sm ${recurFrequency === 'biweekly' ? 'btn-gold' : 'btn-outline'}`}
                        onClick={() => setRecurFrequency('biweekly')}
                        style={{ flex: 1 }}
                      >
                        Cada 2 semanas
                      </button>
                    </div>
                  </div>

                  {selDayOfWeek >= 0 && (
                    <div className="field">
                      <span className="field-hint">
                        Se repite los <strong>{DAY_LABELS[selDayOfWeek]}</strong> a las <strong>{selSlot || '—'}</strong>
                      </span>
                    </div>
                  )}

                  <div className="field">
                    <label className="field-label">Finaliza · opcional</label>
                    <input
                      type="date"
                      className="input"
                      value={recurEndDate}
                      onChange={e => setRecurEndDate(e.target.value)}
                      min={selDate || undefined}
                    />
                    <span className="field-hint">Dejá vacío para que no tenga fin</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {submitError && <div style={{ marginTop: 18 }}><p className="error-msg">{submitError}</p></div>}
        </div>

        <div className="drawer-foot">
          <div className="drawer-summary">
            {slotLabel
              ? <span className="drawer-when">{slotLabel}</span>
              : <span>Completá los datos del turno</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-gold" disabled={!canSubmit} onClick={submitAppointment}>
              {submitting ? 'Guardando…' : isRecurring ? 'Crear serie' : 'Guardar turno'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
