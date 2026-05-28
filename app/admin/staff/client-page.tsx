'use client'
import { useState, useEffect } from 'react'

interface StaffUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function StaffClient() {
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    fetch('/api/staff')
      .then(r => r.json())
      .then(data => { setStaff(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', email: '' })
      load()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al crear usuario.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    if (res.ok) load()
  }

  return (
    <div className="page-wrap--narrow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
          <h1 className="page-title page-title--mb" style={{ marginBottom: 0 }}>Personal</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Agregar'}
        </button>
      </div>

      {showForm && (
        <div className="panel panel--mb">
          <h2 className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Nuevo miembro del personal</h2>
          <form onSubmit={handleAdd} className="form-col">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <p className="field-hint" style={{ fontSize: 12 }}>
              Le va a llegar un email con un link para crear su contraseña.
            </p>
            <button className="btn btn-primary btn-start" disabled={saving}>
              {saving ? 'Enviando…' : 'Enviar invitación'}
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        {loading ? (
          <p style={{ color: 'var(--c-muted)' }}>Cargando…</p>
        ) : staff.length === 0 ? (
          <p style={{ color: 'var(--c-muted)' }}>No hay personal adicional. Agregá un miembro para que pueda acceder al panel.</p>
        ) : (
          <div className="svc-table">
            <div className="svc-row svc-head admin" aria-hidden="true">
              <span className="label">Nombre</span>
              <span className="label">Email</span>
              <span className="label">Estado</span>
              <span />
            </div>
            {staff.map(u => (
              <div key={u.id} className="svc-row admin">
                <span>{u.name}</span>
                <span style={{ color: 'var(--c-muted)', fontSize: 13 }}>{u.email}</span>
                <span style={{ fontSize: 13 }}>{u.status === 'pending' ? 'Pendiente' : 'Activo'}</span>
                <button className="svc-del" aria-label="Eliminar" onClick={() => handleDelete(u.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
