'use client'
import { useRef } from 'react'
import { useAvailableSlots, calcEndTime } from './useAvailableSlots'

type Service = { id: string; name: string; durationMins: number; price: number }

export function ServiceSlotPicker({
  services,
  slug,
  serviceId,
  date,
  slot,
  onServiceChange,
  onDateChange,
  onSlotChange,
  excludeId,
  enabled,
  userId,
}: {
  services: Service[]
  slug: string
  serviceId: string
  date: string
  slot: string
  onServiceChange: (id: string) => void
  onDateChange: (date: string) => void
  onSlotChange: (slot: string) => void
  excludeId?: string
  enabled: boolean
  userId?: string
}) {
  const dateInputRef = useRef<HTMLInputElement>(null)
  const selService = services.find(s => s.id === serviceId)
  const { slots, loading: slotsLoading } = useAvailableSlots(slug, date, serviceId, enabled, excludeId, userId)
  const endTime = slot && selService ? calcEndTime(slot, selService.durationMins) : ''

  return (
    <>
      <div className="field">
        <label className="field-label">Servicio</label>
        <select
          className="select"
          value={serviceId}
          onChange={e => { onServiceChange(e.target.value); onSlotChange('') }}
        >
          <option value="">Seleccionar servicio</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.durationMins} min · ${s.price.toLocaleString('es-AR')}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label">Fecha</label>
        <div style={{ position: 'relative' }}>
          <input
            ref={dateInputRef}
            type="date"
            className="input"
            style={{ paddingRight: 32, color: 'transparent', caretColor: 'transparent' }}
            value={date}
            onChange={e => { onDateChange(e.target.value); onSlotChange('') }}
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
              {date ? new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
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
        {selService && (
          <span className="field-hint">
            {slot
              ? `Duración: ${selService.durationMins} min · termina ${endTime}`
              : `Duración: ${selService.durationMins} min`
            }
          </span>
        )}
      </div>

      <div className="field">
        <label className="field-label">Hora</label>
        {!serviceId || !date ? (
          <span className="field-hint">Seleccioná servicio y fecha primero.</span>
        ) : slotsLoading ? (
          <span className="field-hint">Cargando horarios…</span>
        ) : slots.length === 0 ? (
          <span className="field-hint">No hay horarios disponibles para este día.</span>
        ) : (
          <>
            <div className="slots">
              {slots.map(s => (
                <div
                  key={s}
                  className={`slot${slot === s ? ' selected' : ''}`}
                  onClick={() => onSlotChange(s)}
                >
                  {s}
                </div>
              ))}
            </div>
            {slot && !slots.includes(slot) && (
              <div className="inline-warn" style={{ marginTop: 12 }}>
                <strong>⚠</strong>
                <span>Este horario ya no está disponible. Seleccioná otro.</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
