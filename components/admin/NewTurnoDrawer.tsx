'use client'
import { useState, useEffect, useRef } from 'react'

type Service = { id: string; name: string; durationMins: number; price: number }

function calcEndTime(slot: string, durationMins: number): string {
  const [h, m] = slot.split(':').map(Number)
  const total = h * 60 + m + durationMins
  const eh = Math.floor(total / 60).toString().padStart(2, '0')
  const em = (total % 60).toString().padStart(2, '0')
  return `${eh}:${em}`
}

function SectionHead({ num, label }: { num: string; label: string }) {
  return (
    <div className="section-head">
      <span className="section-num">{num}</span>
      <span className="section-lbl">{label}</span>
    </div>
  )
}

export function NewTurnoDrawer({
  open,
  onClose,
  onCreated,
  barberId,
  slug,
  services,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  barberId: string
  slug: string
  services: Service[]
}) {
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })
  const [selServiceId, setSelServiceId] = useState('')
  const [selDate, setSelDate] = useState('')
  const [selSlot, setSelSlot] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)

  const selService = services.find(s => s.id === selServiceId)

  useEffect(() => {
    if (open) {
      setClientForm({ name: '', phone: '', email: '' })
      setSelServiceId('')
      setSelDate(new Date().toISOString().split('T')[0])
      setSelSlot('')
      setSlots([])
      setSubmitError('')
    }
  }, [open])

  useEffect(() => {
    if (!selDate || !selServiceId || !open) return
    setSlotsLoading(true)
    setSelSlot('')
    fetch(`/api/availability/${slug}?date=${selDate}&serviceId=${selServiceId}`)
      .then(r => r.json())
      .then(data => { setSlots(data.slots || []); setSlotsLoading(false) })
      .catch(() => setSlotsLoading(false))
  }, [selDate, selServiceId, open, slug])

  async function submitAppointment() {
    if (!clientForm.name || !clientForm.phone || !selServiceId || !selDate || !selSlot) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId,
          serviceId: selServiceId,
          clientName: clientForm.name,
          clientPhone: clientForm.phone,
          clientEmail: clientForm.email || null,
          date: selDate,
          time: selSlot,
        }),
      })
      if (res.ok) {
        onClose()
        onCreated()
      } else {
        setSubmitError('Error al crear el turno. Intentá de nuevo.')
      }
    } catch {
      setSubmitError('Error al crear el turno. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = !!(clientForm.name && clientForm.phone && selServiceId && selDate && selSlot && !submitting)

  console.log({
    canSubmit,
    clientForm,
    selServiceId,
    selDate,
    selSlot,
    submitting
  })

  const endTime = selSlot && selService ? calcEndTime(selSlot, selService.durationMins) : ''
  const slotLabel = selDate && selSlot && selService
    ? (() => {
        const d = new Date(selDate + 'T12:00:00')
        const dow = d.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
        const day = d.getDate()
        const month = d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
        return `${dow} ${day} · ${selSlot} — ${endTime}`
      })()
    : ''

  if (!open) return null

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

            <div>
              <SectionHead num="01" label="Cliente" />
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
              <SectionHead num="02" label="Servicio" />
              <select className="select" value={selServiceId} onChange={e => { setSelServiceId(e.target.value); setSelSlot('') }}>
                <option value="">Seleccionar servicio</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.durationMins} min · ${s.price.toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            </div>

            <div className="divider" />

            <div>
              <SectionHead num="03" label="Cuándo" />
              <div className="field">
                <label className="field-label">Fecha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="input"
                    style={{ paddingRight: 32, color: 'transparent', caretColor: 'transparent' }}
                    value={selDate}
                    onChange={e => { setSelDate(e.target.value); setSelSlot('') }}
                  />
                  <div
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 14px', cursor: 'pointer' }}
                    onClick={() => {
                      if (dateInputRef.current?.showPicker) {
                        dateInputRef.current.showPicker()
                      } else {
                        dateInputRef.current?.click()
                      }
                    }}
                  >
                    <span style={{ flex: 1, fontFamily: 'var(--f-body)', fontSize: 14.5, color: 'var(--c-ink)' }}>
                      {selDate ? new Date(selDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                    </span>
                    <span style={{ color: 'var(--c-muted)', display: 'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                  </div>
                </div>
                {selService && selDate && (
                  <span className="field-hint">
                    Duración: {selService.durationMins} min{endTime ? ` · termina ${endTime}` : ''}
                  </span>
                )}
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label className="field-label">Hora</label>
                {!selServiceId || !selDate ? (
                  <span className="field-hint">Seleccioná servicio y fecha primero.</span>
                ) : slotsLoading ? (
                  <span className="field-hint">Cargando horarios…</span>
                ) : slots.length === 0 ? (
                  <span className="field-hint">No hay horarios disponibles para este día.</span>
                ) : (
                  <div className="slots">
                    {slots.map(slot => (
                      <div
                        key={slot}
                        className={`slot${selSlot === slot ? ' selected' : ''}`}
                        onClick={() => setSelSlot(slot)}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              {submitting ? 'Guardando…' : 'Guardar turno'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
