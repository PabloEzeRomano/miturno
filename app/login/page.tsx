'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'
import { useCategory } from '@/lib/theme-context'

export default function LoginPage() {
  const router = useRouter()
  const { appName } = useCategory()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Email o contraseña incorrectos.')
    } else {
      router.push('/admin/agenda')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link href="/" className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>

        <div className="panel">
          <h1 className="auth-title">Iniciá sesión</h1>
          <p className="auth-sub">Accedé a tu agenda de {appName}.</p>

          <form onSubmit={handleSubmit} className="form-col">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="vos@ejemplo.com" autoFocus />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          ¿No tenés cuenta?{' '}<Link href="/signup">Registrate gratis</Link>
        </p>
      </div>
    </div>
  )
}
