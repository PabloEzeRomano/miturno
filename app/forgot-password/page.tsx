'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al enviar el email.')
      return
    }
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link href="/" className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>

        <div className="panel">
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📩</div>
              <h1 className="auth-title">Revisá tu email</h1>
              <p className="auth-sub" style={{ marginBottom: 24 }}>
                Si existe una cuenta con <strong>{email}</strong>, vas a recibir un enlace para recuperar tu contraseña en los próximos minutos.
              </p>
              <Link href="/login" className="btn btn-ghost btn-full">Volver al login</Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Recuperar contraseña</h1>
              <p className="auth-sub">Ingresá tu email y te enviamos un enlace para crear una nueva.</p>

              <form onSubmit={handleSubmit} className="form-col">
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="vos@ejemplo.com"
                    autoFocus
                  />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="auth-footer">
          <Link href="/login">← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}
