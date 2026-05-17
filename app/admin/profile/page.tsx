'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', phone: '', shopName: '' })
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(data => {
      setForm({ name: data.name || '', phone: data.phone || '', shopName: data.shopName || '' })
      setSlug(data.slug || '')
    }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const d = await res.json()
      setError(d.error || 'Error al guardar.')
    }
  }

  return (
    <div className="page-wrap--narrow">
      <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
      <h1 className="page-title page-title--mb">Mi perfil</h1>

      <div className="panel panel--mb">
        <div className="form-col">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Nombre del local</label>
            <input className="input" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 9 11 1234-5678" />
          </div>

          <div>
            <label className="label">Tu link público</label>
            <div className="field-mono">
              turnos.gemm-apps.com/<em className="field-gold">{slug}</em>
            </div>
            <p className="field-hint">El link público no se puede cambiar para no romper reservas existentes.</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary btn-start" onClick={save} disabled={saving}>
            {saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
