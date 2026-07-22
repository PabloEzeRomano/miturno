'use client'
import { useState, useEffect, useRef } from 'react'

function WAConnect() {
  const [state, setState] = useState<'loading' | 'open' | 'qr'>('loading')
  const [qr, setQr] = useState<string | null>(null)
  const [instanceName, setInstanceName] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchStatus() {
    const res = await fetch('/api/wa-instance')
    const data = await res.json()
    setInstanceName(data.instanceName)
    if (data.state === 'open') {
      setState('open')
      if (intervalRef.current) clearInterval(intervalRef.current)
    } else {
      setState('qr')
      setQr(data.qr)
    }
  }

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, 17000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function handleDisconnect() {
    await fetch('/api/wa-instance', { method: 'DELETE' })
    setState('loading')
    setQr(null)
    fetchStatus()
  }

  return (
    <div className="panel panel--mb">
      <div className="reminder-row-header">
        <div>
          <h2 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>WhatsApp</h2>
          <p className="field-hint">Conectá el número del negocio para enviar recordatorios.</p>
        </div>
        {state === 'open' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--c-success)', fontWeight: 600, fontSize: 13 }}>✓ Conectado</span>
            <button className="btn btn-outline btn-sm" onClick={handleDisconnect}>Desconectar</button>
          </div>
        )}
      </div>

      {state === 'loading' && <p className="field-hint" style={{ marginTop: 12 }}>Verificando…</p>}

      {state === 'qr' && (
        <div style={{ marginTop: 16 }}>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            ⚠️ Requiere <strong>WhatsApp personal</strong> (no Business). Abrí WhatsApp → Dispositivos vinculados → Vincular dispositivo → escaneá este código.
          </p>
          {qr
            ? <img src={qr} alt="QR WhatsApp" style={{ width: 200, height: 200, borderRadius: 8, border: '1px solid var(--c-line)' }} />
            : <p className="field-hint">Generando QR…</p>
          }
          <p className="field-hint" style={{ marginTop: 8, fontSize: 12 }}>El código se actualiza cada 17 segundos.</p>
        </div>
      )}
    </div>
  )
}

function HoursMinutesPicker({ value, onChange, maxHours = 48 }: {
  value: number
  onChange: (v: number) => void
  maxHours?: number
}) {
  const h = Math.floor(value)
  const m = Math.round(((value - h) * 60) / 15) * 15

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select
        className="input"
        style={{ width: 80 }}
        value={h}
        onChange={e => onChange(Number(e.target.value) + m / 60)}
      >
        {Array.from({ length: maxHours + 1 }, (_, i) => (
          <option key={i} value={i}>{i}h</option>
        ))}
      </select>
      <select
        className="input"
        style={{ width: 90 }}
        value={m}
        onChange={e => onChange(h + Number(e.target.value) / 60)}
      >
        {[0, 15, 30, 45].map(min => (
          <option key={min} value={min}>{String(min).padStart(2, '0')} min</option>
        ))}
      </select>
    </div>
  )
}

interface Settings {
  id?: string
  googleReviewUrl?: string
  cancelRescheduleEnabled: boolean
  cancelRescheduleHoursBefore: number
  reminderEnabled: boolean
  reminderHoursBefore: number
  reviewEnabled: boolean
  reviewHoursAfter: number
}

const DEFAULTS: Settings = {
  googleReviewUrl: '',
  cancelRescheduleEnabled: false,
  cancelRescheduleHoursBefore: 5,
  reminderEnabled: false,
  reminderHoursBefore: 1,
  reviewEnabled: false,
  reviewHoursAfter: 1.5,
}

export default function RecordatoriosPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    fetch('/api/reminder-settings')
      .then(r => r.json())
      .then(data => {
        setSettings({ ...DEFAULTS, ...data })
        setLoaded(true)
      })
  }, [])

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/reminder-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!loaded) return <div className="page-wrap"><p style={{ color: 'var(--c-muted)' }}>Cargando…</p></div>

  return (
    <div className="page-wrap--narrow">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
          <h1 className="page-title">Recordatorios</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <WAConnect />

      {/* Cancel/reschedule */}
      <div className="panel panel--mb">
        <div className="reminder-row-header">
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Link de cancelación / reprogramación</h3>
            <p className="field-hint">Enviado antes del turno con el link para que el cliente gestione.</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.cancelRescheduleEnabled}
              onChange={e => set('cancelRescheduleEnabled', e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>
        {settings.cancelRescheduleEnabled && (
          <div style={{ marginTop: 16 }}>
            <label className="label">Tiempo antes del turno</label>
            <HoursMinutesPicker
              value={settings.cancelRescheduleHoursBefore}
              onChange={v => set('cancelRescheduleHoursBefore', v)}
              maxHours={48}
            />
          </div>
        )}
      </div>

      {/* Reminder */}
      <div className="panel panel--mb">
        <div className="reminder-row-header">
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Recordatorio del turno</h3>
            <p className="field-hint">Recordatorio simple enviado poco antes del turno.</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={e => set('reminderEnabled', e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>
        {settings.reminderEnabled && (
          <div style={{ marginTop: 16 }}>
            <label className="label">Tiempo antes del turno</label>
            <HoursMinutesPicker
              value={settings.reminderHoursBefore}
              onChange={v => set('reminderHoursBefore', v)}
              maxHours={24}
            />
          </div>
        )}
      </div>

      {/* Review */}
      <div className="panel panel--mb">
        <div className="reminder-row-header">
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Pedido de reseña</h3>
            <p className="field-hint">Enviado después del turno con link a Google Maps.</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.reviewEnabled}
              onChange={e => set('reviewEnabled', e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
        </div>
        {settings.reviewEnabled && (
          <div className="form-col" style={{ marginTop: 16 }}>
            <div>
              <label className="label">Tiempo después del turno</label>
              <HoursMinutesPicker
                value={settings.reviewHoursAfter}
                onChange={v => set('reviewHoursAfter', v)}
                maxHours={48}
              />
            </div>
            <div>
              <label className="label">URL de reseña en Google Maps</label>
              <input
                className="input"
                type="url"
                placeholder="https://g.page/r/..."
                value={settings.googleReviewUrl ?? ''}
                onChange={e => set('googleReviewUrl', e.target.value)}
              />
              <p className="field-hint" style={{ marginTop: 4 }}>
                En Google Maps → tu local → Reseñas → &quot;Obtener enlace para reseñas&quot;.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
