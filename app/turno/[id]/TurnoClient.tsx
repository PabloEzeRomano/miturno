'use client'

import { useState } from 'react'

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

export function TurnoClient({ appt }: { appt: ApptInfo }) {
  const [view, setView] = useState<View>(appt.status === 'cancelled' ? 'detail' : 'verify')
  const [phone, setPhone] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [doneMsg, setDoneMsg] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  async function handleVerify() {
    if (!phone.trim()) return
    setLoading(true)
    setVerifyError('')
    // We verify by attempting a no-op patch with the phone. If 403 → wrong phone.
    const res = await fetch(`/api/turno/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: '_verify' }),
    })
    setLoading(false)
    if (res.status === 403) {
      setVerifyError('Teléfono incorrecto. Ingresá el número con el que hiciste la reserva.')
      return
    }
    // 400 on _verify action is expected — means phone matched
    if (res.status === 400 || res.ok) {
      setView('detail')
      return
    }
    const body = await res.json()
    setVerifyError(body.error ?? 'Error al verificar.')
  }

  async function handleCancel() {
    if (!confirm('¿Confirmás que querés cancelar el turno?')) return
    setLoading(true)
    const res = await fetch(`/api/turno/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'cancel' }),
    })
    setLoading(false)
    if (res.ok) {
      setDoneMsg('Tu turno fue cancelado correctamente.')
      setView('done')
    }
  }

  async function loadSlots(date: string) {
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot('')
    const res = await fetch(
      `/api/availability/${appt.establishment.slug}?date=${date}&serviceId=${appt.service.id}&userId=${appt.pro.id}&excludeId=${appt.id}`
    )
    setSlotsLoading(false)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots ?? [])
    }
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
      setDoneMsg(`Tu turno fue reprogramado para el ${formatDate(rescheduleDate + 'T' + selectedSlot)} a las ${selectedSlot}.`)
      setView('done')
    }
  }

  const cancelled = appt.status === 'cancelled'

  return (
    <div className="turno-page">
      <div className="turno-card">
        <div className="turno-header">
          <div className="turno-shop">{appt.establishment.shopName}</div>
          <div className={`turno-badge turno-badge--${cancelled ? 'cancelled' : 'confirmed'}`}>
            {cancelled ? 'Cancelado' : 'Confirmado'}
          </div>
        </div>

        <div className="turno-info">
          <div className="turno-row">
            <span className="turno-label">Servicio</span>
            <span className="turno-value">{appt.service.name}</span>
          </div>
          <div className="turno-row">
            <span className="turno-label">Profesional</span>
            <span className="turno-value">{appt.pro.name}</span>
          </div>
          <div className="turno-row">
            <span className="turno-label">Fecha</span>
            <span className="turno-value">{formatDate(appt.startsAt)}</span>
          </div>
          <div className="turno-row">
            <span className="turno-label">Hora</span>
            <span className="turno-value">{formatTime(appt.startsAt)}</span>
          </div>
          <div className="turno-row">
            <span className="turno-label">Precio</span>
            <span className="turno-value">${appt.service.price.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {view === 'verify' && (
          <div className="turno-verify">
            <p className="turno-verify-hint">
              Ingresá tu número de teléfono para gestionar el turno.
            </p>
            <input
              className="form-input"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            {verifyError && <p className="turno-error">{verifyError}</p>}
            <button className="btn btn-primary" onClick={handleVerify} disabled={loading}>
              {loading ? 'Verificando…' : 'Confirmar identidad'}
            </button>
          </div>
        )}

        {view === 'detail' && !cancelled && (
          <div className="turno-actions">
            <button className="btn btn-primary" onClick={() => setView('reschedule')}>
              Reprogramar
            </button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={loading}>
              {loading ? 'Cancelando…' : 'Cancelar turno'}
            </button>
          </div>
        )}

        {view === 'reschedule' && (
          <div className="turno-reschedule">
            <h3 className="turno-section-title">Elegí una nueva fecha</h3>
            <input
              className="form-input"
              type="date"
              min={todayStr}
              value={rescheduleDate}
              onChange={(e) => {
                setRescheduleDate(e.target.value)
                if (e.target.value) loadSlots(e.target.value)
              }}
            />

            {slotsLoading && <p className="turno-hint">Cargando horarios…</p>}

            {!slotsLoading && slots.length > 0 && (
              <>
                <div className="slots-grid">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      className={`slot-btn${selectedSlot === slot ? ' slot-btn--selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="turno-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleReschedule}
                    disabled={!selectedSlot || loading}
                  >
                    {loading ? 'Guardando…' : 'Confirmar reprogramación'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setView('detail')}>
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {!slotsLoading && rescheduleDate && slots.length === 0 && (
              <p className="turno-hint">No hay horarios disponibles para esa fecha. Probá con otro día.</p>
            )}
          </div>
        )}

        {view === 'done' && (
          <div className="turno-done">
            <p className="turno-done-msg">✓ {doneMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}
