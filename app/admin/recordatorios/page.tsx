'use client'
import { useState, useEffect } from 'react'

interface Settings {
  id?: string
  waApiKey?: string
  waPhoneNumberId?: string
  googleReviewUrl?: string
  cancelRescheduleEnabled: boolean
  cancelRescheduleHoursBefore: number
  reminderEnabled: boolean
  reminderHoursBefore: number
  reviewEnabled: boolean
  reviewHoursAfter: number
}

const DEFAULTS: Settings = {
  waApiKey: '',
  waPhoneNumberId: '',
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
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      {/* WhatsApp credentials */}
      <div className="panel panel--mb">
        <h2 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Credenciales WhatsApp</h2>
        <p className="field-hint" style={{ marginBottom: 16 }}>
          Necesitás una cuenta de Meta Business con WhatsApp Cloud API habilitado.
          Si no configurás estas credenciales, los mensajes se registran en el log del servidor (modo prueba).
        </p>
        <div className="form-col">
          <div>
            <label className="label">API Key (Access Token)</label>
            <input
              className="input"
              type="password"
              placeholder="EAA..."
              value={settings.waApiKey ?? ''}
              onChange={e => set('waApiKey', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Phone Number ID</label>
            <input
              className="input"
              type="text"
              placeholder="1234567890"
              value={settings.waPhoneNumberId ?? ''}
              onChange={e => set('waPhoneNumberId', e.target.value)}
            />
          </div>
        </div>
      </div>

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
            <label className="label">Horas antes del turno</label>
            <input
              className="input"
              type="number"
              min={1}
              max={48}
              step={0.5}
              value={settings.cancelRescheduleHoursBefore}
              onChange={e => set('cancelRescheduleHoursBefore', Number(e.target.value))}
              style={{ width: 100 }}
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
            <label className="label">Horas antes del turno</label>
            <input
              className="input"
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={settings.reminderHoursBefore}
              onChange={e => set('reminderHoursBefore', Number(e.target.value))}
              style={{ width: 100 }}
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
              <label className="label">Horas después del turno</label>
              <input
                className="input"
                type="number"
                min={0.5}
                max={48}
                step={0.5}
                value={settings.reviewHoursAfter}
                onChange={e => set('reviewHoursAfter', Number(e.target.value))}
                style={{ width: 100 }}
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
