'use client'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default function ProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', shopName: '' })
  const [slug, setSlug] = useState('')
  const [role, setRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => { setBaseUrl(window.location.origin) }, [])

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(data => {
      setForm({ name: data.name || '', phone: data.phone || '', shopName: data.shopName || '' })
      setSlug(data.slug || '')
      setRole(data.role || '')
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

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch('/api/profile', { method: 'DELETE' })
    if (res.ok) {
      await signOut({ redirect: false })
      router.push('/')
    } else {
      setError('Error al eliminar la cuenta.')
      setDeleting(false)
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
            {role === 'Owner' ? (
              <input className="input" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} />
            ) : (
              <input className="input" value={form.shopName} disabled />
            )}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+54 9 11 1234-5678" />
          </div>

          <div>
            <label className="label">Tu URL</label>
            <div className="field-mono">
              {baseUrl}/<em className="field-gold">{slug}</em>
            </div>
            <p className="field-hint">Tu URL no se puede cambiar para no romper las reservas existentes.</p>
          </div>

          {slug && baseUrl && (
            <div>
              <label className="label">Tu QR</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                <QRCodeSVG value={`${baseUrl}/${slug}`} size={72} level="H" />
                <Link href="/admin/qr" target="_blank" className="btn btn-outline btn-sm">
                  Ver para imprimir
                </Link>
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary btn-start" onClick={save} disabled={saving}>
            {saved ? '¡Guardado!' : saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="panel" style={{ borderColor: 'var(--c-danger)', background: 'var(--c-danger-bg)' }}>
        <h2 className="section-title" style={{ fontSize: 18, marginBottom: 8 }}>Eliminar cuenta</h2>
        <p style={{ fontSize: 14, color: 'var(--c-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Esto eliminará tu cuenta, tus servicios, tu agenda, y todas las reservas asociadas. No se puede deshacer.
        </p>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>¿Estás seguro?</span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--c-danger)', color: 'var(--c-danger)' }} onClick={() => setConfirmDelete(true)}>
            Eliminar mi cuenta
          </button>
        )}
      </div>
    </div>
  )
}
