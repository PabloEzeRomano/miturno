'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Service = { id: string; name: string; durationMins: number; price: number }
type User = { id: string; name: string }

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isDateBlocked(date: Date, blockedDates: { date: string; endDate: string | null }[]): boolean {
  const ts = date.getTime()
  return blockedDates.some(b => {
    const start = new Date(b.date).getTime()
    const end = b.endDate ? new Date(b.endDate).getTime() : start
    return ts >= start && ts <= end
  })
}

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const pad = first.getDay()
  const days: (Date | null)[] = []
  for (let i = 0; i < pad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

export function BookingFlow({ establishmentId, slug, services, users, userServiceMap, availability, blockedDates }: {
  establishmentId: string
  slug: string
  services: Service[]
  users: User[]
  userServiceMap: Record<string, string[]>
  availability: { userId: string; dayOfWeek: number; isActive: boolean }[]
  blockedDates: { date: string; endDate: string | null }[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(users.length === 1 ? users[0] : null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)

  const hasMultipleUsers = users.length > 1

  const activeServices = useMemo(() => {
    if (!selectedUser) return services
    const ids = userServiceMap[selectedUser.id]
    if (!ids || ids.length === 0) return services
    return services.filter(s => ids.includes(s.id))
  }, [selectedUser, services, userServiceMap])

  // Reset service if not available for new user
  useEffect(() => {
    if (selectedService && !activeServices.some(s => s.id === selectedService.id)) {
      setSelectedService(null)
    }
  }, [activeServices, selectedService])

  // Reset date/slot when user changes
  useEffect(() => {
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
  }, [selectedUser])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('corturno_client')
      if (saved) setForm(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedUser) return
    setSlotsLoading(true)
    const dateStr = toDateStr(selectedDate)
    const params = new URLSearchParams({ date: dateStr, serviceId: selectedService.id, userId: selectedUser.id })
    fetch(`/api/availability/${slug}?${params}`)
      .then(r => r.json())
      .then(data => { setSlots(data.slots || []); setSlotsLoading(false) })
      .catch(() => setSlotsLoading(false))
  }, [selectedDate, selectedService, selectedUser, slug])

  async function submitBooking() {
    if (!selectedService || !selectedDate || !selectedSlot || !selectedUser) return
    setSubmitting(true)
    try {
      localStorage.setItem('corturno_client', JSON.stringify(form))
    } catch {}
    const dateStr = toDateStr(selectedDate)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        establishmentId,
        serviceId: selectedService.id,
        clientName: form.name,
        clientPhone: form.phone,
        clientEmail: form.email || null,
        date: dateStr,
        time: selectedSlot,
        userId: selectedUser.id,
      }),
    })
    if (res.ok) {
      const appt = await res.json()
      router.push(`/${slug}/confirm?id=${appt.id}`)
    }
    setSubmitting(false)
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const calDays = getCalendarDays(calYear, calMonth)

  function isDateAvailable(date: Date): boolean {
    if (date < today) return false
    if (!selectedUser) return true
    const dow = date.getDay()
    const userDays = availability.filter(a => a.userId === selectedUser.id && a.isActive)
    if (userDays.length === 0) return true
    if (!userDays.some(a => a.dayOfWeek === dow)) return false
    return !isDateBlocked(date, blockedDates)
  }

  // Steps:
  // Multi-user:  1=pro  2=service  3=date  4=time  5=form
  // Single-user: 1=service  2=date  3=time  4=form
  const totalSteps = hasMultipleUsers ? 5 : 4
  const stepPips = Array.from({ length: totalSteps }, (_, i) => i + 1)

  function stepOf(name: 'pro' | 'service' | 'date' | 'time' | 'form'): number {
    if (hasMultipleUsers) {
      return ({ pro: 1, service: 2, date: 3, time: 4, form: 5 } as Record<string, number>)[name] ?? 0
    }
    return ({ service: 1, date: 2, time: 3, form: 4 } as Record<string, number>)[name] ?? 0
  }

  return (
    <div className="booking-flow">
      <div className="step-bar">
        {stepPips.map(s => (
          <div key={s} className={`step-pip${s <= step ? ' step-pip--active' : ''}`} />
        ))}
      </div>

      {/* Step: Professional (multi-user only) */}
      {hasMultipleUsers && step === stepOf('pro') && (
        <div>
          <h2 className="step-h2">Elegí tu profesional</h2>
          <div className="svc-list">
            {users.map(u => {
              const sel = selectedUser?.id === u.id
              return (
                <button key={u.id} onClick={() => setSelectedUser(u)} className={`svc-btn${sel ? ' svc-btn--sel' : ''}`}>
                  <div className="svc-btn-name">{u.name}</div>
                </button>
              )
            })}
          </div>
          <button className="btn btn-primary btn-full mt-24" disabled={!selectedUser} onClick={() => setStep(stepOf('service'))}>
            Siguiente →
          </button>
        </div>
      )}

      {/* Step: Service */}
      {step === stepOf('service') && (
        <div>
          <h2 className="step-h2">Elegí tu servicio</h2>
          <div className="svc-list">
            {activeServices.map(svc => {
              const sel = selectedService?.id === svc.id
              return (
                <button key={svc.id} onClick={() => setSelectedService(svc)} className={`svc-btn${sel ? ' svc-btn--sel' : ''}`}>
                  <div>
                    <div className="svc-btn-name">{svc.name}</div>
                    <div className="svc-btn-dur">{svc.durationMins} min</div>
                  </div>
                  <div className="svc-btn-price">${svc.price.toLocaleString('es-AR')}</div>
                </button>
              )
            })}
          </div>
          <div className={hasMultipleUsers ? 'step-actions' : ''}>
            {hasMultipleUsers && (
              <button className="btn btn-ghost" onClick={() => setStep(stepOf('pro'))}>← Atrás</button>
            )}
            <button
              className={`btn btn-primary${hasMultipleUsers ? ' step-next' : ' btn-full mt-24'}`}
              disabled={!selectedService}
              onClick={() => setStep(stepOf('date'))}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Step: Date */}
      {step === stepOf('date') && (
        <div>
          <h2 className="step-h2">Elegí la fecha</h2>
          <div className="cal-nav">
            <button className="btn btn-ghost btn-sm" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}>←</button>
            <span className="cal-month">{MONTHS_ES[calMonth]} {calYear}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}>→</button>
          </div>
          <div className="cal-dow-grid">
            {DAYS_ES.map(d => <div key={d} className="cal-dow">{d}</div>)}
          </div>
          <div className="cal-days-grid">
            {calDays.map((date, i) => {
              if (!date) return <div key={i} />
              const isPast = date < today
              const isToday = date.getTime() === today.getTime()
              const isSel = selectedDate?.toDateString() === date.toDateString()
              const available = isDateAvailable(date)
              return (
                <button key={i} disabled={!available} onClick={() => setSelectedDate(date)}
                  className={`cal-day${!available ? ' cal-day--past' : isSel ? ' cal-day--sel' : isToday ? ' cal-day--today' : ''}`}>
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setStep(stepOf('service'))}>← Atrás</button>
            <button className="btn btn-primary step-next" disabled={!selectedDate} onClick={() => setStep(stepOf('time'))}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* Step: Time */}
      {step === stepOf('time') && (
        <div>
          <h2 className="step-h2 step-h2--sm">Elegí el horario</h2>
          {selectedDate && <p className="step-sub">{selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
          {slotsLoading ? (
            <p className="step-sub">Cargando horarios…</p>
          ) : slots.length === 0 ? (
            <p className="step-sub">No hay horarios disponibles para este día.</p>
          ) : (
            <div className="slots-grid">
              {slots.map(slot => (
                <button key={slot} onClick={() => setSelectedSlot(slot)} className={`slot-btn${selectedSlot === slot ? ' slot-btn--sel' : ''}`}>
                  {slot}
                </button>
              ))}
            </div>
          )}
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setStep(stepOf('date'))}>← Atrás</button>
            <button className="btn btn-primary step-next" disabled={!selectedSlot} onClick={() => setStep(stepOf('form'))}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* Step: Client form */}
      {step === stepOf('form') && (
        <div>
          <h2 className="step-h2 step-h2--sm">Tus datos</h2>
          <p className="step-sub">
            {selectedService?.name} · {selectedUser?.name}{selectedUser ? ' · ' : ''}{selectedDate?.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} a las {selectedSlot}
          </p>
          <div className="form-col">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Tu nombre completo" />
            </div>
            <div>
              <label className="label">Teléfono *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required placeholder="+54 9 11 1234-5678" />
            </div>
            <div>
              <label className="label">Email <span className="label-optional">(opcional)</span></label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
            </div>
          </div>
          <div className="step-actions">
            <button className="btn btn-ghost" onClick={() => setStep(stepOf('time'))}>← Atrás</button>
            <button className="btn btn-gold step-next" disabled={!form.name || !form.phone || submitting} onClick={submitBooking}>
              {submitting ? 'Reservando…' : `Reservar ${selectedSlot}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
