'use client'

import { useState } from 'react'
import { BrandMark, Wordmark } from '@/components/Brand'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FormField } from '@/components/ui/FormField'

interface ApptInfo {
  id: string
  status: string
  startsAt: string
  endsAt: string
  clientInitials: string
  service: { id: string; name: string; durationMins: number; price: number }
  pro: { id: string; name: string }
  establishment: { id: string; shopName: string; slug: string }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

type View = 'verify' | 'detail' | 'reschedule' | 'done'

const DETAIL_ROWS: Array<[string, (a: ApptInfo) => string]> = [
  ['Servicio', (a) => a.service.name],
  ['Profesional', (a) => a.pro.name],
  ['Fecha', (a) => formatDate(a.startsAt)],
  ['Hora', (a) => formatTime(a.startsAt)],
  ['Precio', (a) => `$${a.service.price.toLocaleString('es-AR')}`],
]

export function TurnoClient({ appt }: { appt: ApptInfo }) {
  const [view, setView] = useState<View>(appt.status === 'cancelled' ? 'detail' : 'verify')
  const [phone, setPhone] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [doneMsg, setDoneMsg] = useState('')
  const todayStr = new Date().toISOString().split('T')[0]
  const cancelled = appt.status === 'cancelled'

  async function handleVerify() {
    if (!phone.trim()) return
    setLoading(true)
    setVerifyError('')
    const res = await fetch(`/api/turno/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: '_verify' }),
    })
    setLoading(false)
    if (res.status === 403) {
      setVerifyError('Número incorrecto. Usá el que ingresaste al reservar.')
      return
    }
    if (res.status === 400 || res.ok) { setView('detail'); return }
    const body = await res.json()
    setVerifyError(body.error ?? 'Error al verificar.')
  }

  async function handleCancel() {
    if (!confirm('¿Confirmás que querés cancelar?')) return
    setLoading(true)
    const res = await fetch(`/api/turno/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'cancel' }),
    })
    setLoading(false)
    if (res.ok) { setDoneMsg('Tu turno fue cancelado.'); setView('done') }
  }

  async function loadSlots(date: string) {
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot('')
    const res = await fetch(
      `/api/availability/${appt.establishment.slug}?date=${date}&serviceId=${appt.service.id}&userId=${appt.pro.id}&excludeId=${appt.id}`
    )
    setSlotsLoading(false)
    if (res.ok) { const data = await res.json(); setSlots(data.slots ?? []) }
  }

  async function handleReschedule() {
    if (!selectedSlot) return
    setLoading(true)
    const res = await fetch(`/api/turno/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'reschedule', date: rescheduleDate, time: selectedSlot }),
    })
    setLoading(false)
    if (res.ok) {
      setDoneMsg(`Turno reprogramado para el ${formatDate(rescheduleDate + 'T' + selectedSlot)} a las ${selectedSlot}.`)
      setView('done')
    }
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <div className="booking-header-inner">
          <span className="auth-logo" style={{ cursor: 'default' }}>
            <BrandMark size={28} />
            <Wordmark size={18} />
          </span>
        </div>
      </header>

      <div className="booking-flow">
        {/* Shop + status */}
        <div style={{ marginBottom: 24 }}>
          <span className="booking-header-eyebrow">Tu turno</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <h1 className="booking-shop-name">{appt.establishment.shopName}</h1>
            <Badge variant={cancelled ? 'cancelled' : 'confirmed'}>
              {cancelled ? 'Cancelado' : 'Confirmado'}
            </Badge>
          </div>
        </div>

        {/* Appointment details */}
        <div className="panel panel--mb">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DETAIL_ROWS.map(([label, getValue]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                <span className="label" style={{ marginBottom: 0, flexShrink: 0 }}>{label}</span>
                <span className="row-value">{getValue(appt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verify identity */}
        {view === 'verify' && (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 className="step-h2" style={{ marginBottom: 6 }}>Verificá tu identidad</h2>
              <p className="step-sub" style={{ margin: 0 }}>Ingresá el número con el que hiciste la reserva.</p>
            </div>
            <FormField
              label="Teléfono"
              hint="Solo números, sin espacios ni guiones. Ej: 1122550533"
              error={verifyError}
            >
              <input
                className="input"
                type="tel"
                inputMode="numeric"
                placeholder="1122550533"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </FormField>
            <Button onClick={handleVerify} disabled={loading} full>
              {loading ? 'Verificando…' : 'Verificar'}
            </Button>
          </div>
        )}

        {/* Actions */}
        {view === 'detail' && !cancelled && (
          <div className="step-actions">
            <Button onClick={() => setView('reschedule')} className="step-next">
              Reprogramar
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={loading} className="step-next">
              {loading ? 'Cancelando…' : 'Cancelar turno'}
            </Button>
          </div>
        )}

        {/* Reschedule */}
        {view === 'reschedule' && (
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 className="step-h2" style={{ marginBottom: 0 }}>Nueva fecha</h2>

            <FormField label="Fecha">
              <input
                className="input"
                type="date"
                min={todayStr}
                value={rescheduleDate}
                onChange={(e) => { setRescheduleDate(e.target.value); if (e.target.value) loadSlots(e.target.value) }}
              />
            </FormField>

            {slotsLoading && <p className="field-hint">Cargando horarios…</p>}

            {!slotsLoading && slots.length > 0 && (
              <>
                <div className="slots-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      className={`slot-btn${selectedSlot === slot ? ' slot-btn--sel' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="step-actions">
                  <Button onClick={handleReschedule} disabled={!selectedSlot || loading} className="step-next">
                    {loading ? 'Guardando…' : 'Confirmar'}
                  </Button>
                  <Button variant="ghost" onClick={() => setView('detail')}>
                    Volver
                  </Button>
                </div>
              </>
            )}

            {!slotsLoading && rescheduleDate && slots.length === 0 && (
              <p className="field-hint">Sin horarios para esa fecha. Probá con otro día.</p>
            )}
          </div>
        )}

        {/* Done */}
        {view === 'done' && (
          <div className="panel" style={{ textAlign: 'center', padding: '36px 28px' }}>
            <div className="confirm-icon" style={{ margin: '0 auto 20px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" stroke="var(--c-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{doneMsg}</p>
          </div>
        )}

        <p className="eyebrow" style={{ textAlign: 'center', marginTop: 32, opacity: 0.5, fontSize: 11 }}>
          Enviado usando miturno
        </p>
      </div>
    </div>
  )
}
