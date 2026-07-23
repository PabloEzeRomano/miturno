'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al restablecer la contraseña.')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p className="auth-sub">Enlace inválido. Solicitá uno nuevo.</p>
        <Link href="/forgot-password" className="btn btn-primary btn-full" style={{ marginTop: 16 }}>
          Recuperar contraseña
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <h1 className="auth-title">Contraseña actualizada</h1>
        <p className="auth-sub">Redirigiendo al login…</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="auth-title">Nueva contraseña</h1>
      <p className="auth-sub">Elegí una contraseña nueva para tu cuenta.</p>

      <form onSubmit={handleSubmit} className="form-col">
        <div>
          <label className="label">Nueva contraseña</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            autoFocus
          />
        </div>
        <div>
          <label className="label">Repetir contraseña</label>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link href="/" className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>

        <div className="panel">
          <Suspense fallback={<p className="auth-sub">Cargando…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="auth-footer">
          <Link href="/login">← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}
