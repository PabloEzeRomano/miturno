'use client'
import { useState, useEffect, useRef } from 'react'

function WAConnect() {
  const [state, setState] = useState<'loading' | 'open' | 'setup' | 'code'>('loading')
  const [phone, setPhone] = useState('')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function checkState() {
    const res = await fetch('/api/wa-instance')
    const data = await res.json()
    if (data.state === 'open') {
      setState('open')
      if (pollRef.current) clearInterval(pollRef.current)
      // save instance to DB
      fetch('/api/wa-instance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save' }) })
    }
  }

  useEffect(() => {
    checkState().then(() => setState(s => s === 'loading' ? 'setup' : s))
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function handleGetCode() {
    if (!phone.trim()) return
    setWorking(true)
    // ensure instance exists
    await fetch('/api/wa-instance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create' }) })
    const res = await fetch('/api/wa-instance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'pairingCode', phone }) })
    const data = await res.json()
    setPairingCode(data.code)
    setState('code')
    setWorking(false)
    // poll state every 5s until connected
    pollRef.current = setInterval(checkState, 5000)
  }

  async function handleDisconnect() {
    await fetch('/api/wa-instance', { method: 'DELETE' })
    setState('setup')
    setPairingCode(null)
    setPhone('')
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

      {state === 'setup' && (
        <div style={{ marginTop: 16 }}>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            ⚠️ Requiere <strong>WhatsApp personal</strong> (no Business). Ingresá el número sin el 0 ni el 15.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>+549</span>
            <input
              className="input"
              style={{ maxWidth: 160 }}
              placeholder="11 2255 0533"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={handleGetCode} disabled={working || !phone.trim()}>
              {working ? 'Generando…' : 'Obtener código'}
            </button>
          </div>
        </div>
      )}

      {state === 'code' && pairingCode && (
        <div style={{ marginTop: 16 }}>
          <p className="field-hint" style={{ marginBottom: 8 }}>
            En WhatsApp → <strong>Dispositivos vinculados</strong> → Vincular dispositivo → <strong>Vincular con número de teléfono</strong> → ingresá este código:
          </p>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6, fontFamily: 'monospace', color: 'var(--c-gold)' }}>
            {pairingCode}
          </div>
          <p className="field-hint" style={{ marginTop: 8 }}>Esperando conexión…</p>
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
