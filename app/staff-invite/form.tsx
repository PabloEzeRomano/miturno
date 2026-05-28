'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandMark, Wordmark } from '@/components/Brand'

export default function StaffInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [valid, setValid] = useState<boolean | null>(null)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) { setValid(false); return }
    fetch(`/api/staff/accept-invite?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setValid(true); setUserInfo(data) })
      .catch(() => setValid(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const res = await fetch('/api/staff/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    if (res.ok) {
      await signIn('credentials', { email: userInfo!.email, password, redirect: false })
      router.push('/admin/agenda')
    } else {
      const data = await res.json()
      setError(data.error || 'Error al aceptar la invitación.')
      setSaving(false)
    }
  }

  if (valid === null) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-logo">
            <BrandMark size={28} />
            <Wordmark size={20} />
          </div>
          <p style={{ textAlign: 'center', color: 'var(--c-muted)', marginTop: 24 }}>Verificando invitación…</p>
        </div>
      </div>
    )
  }

  if (!valid || !userInfo) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-logo">
            <BrandMark size={28} />
            <Wordmark size={20} />
          </div>
          <h1 className="auth-title" style={{ marginTop: 24 }}>Invitación inválida</h1>
          <p className="auth-sub">El link que usaste no es válido o ya fue utilizado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </div>

        <h1 className="auth-title" style={{ marginTop: 24 }}>Unite al panel</h1>
        <p className="auth-sub">
          {userInfo.name} — {userInfo.email}
        </p>

        <form onSubmit={handleSubmit} className="form-col">
          <div>
            <label className="label">Creá tu contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              autoFocus
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary btn-start" disabled={saving}>
            {saving ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
