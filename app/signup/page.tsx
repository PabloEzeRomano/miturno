'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shopName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/barbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al registrarse.')
      setLoading(false)
      return
    }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/admin/agenda')
  }

  return (
    <div className="auth-page">
      <div className="auth-box--wide">
        <Link href="/" className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </Link>

        <div className="panel">
          <h1 className="auth-title">Creá tu cuenta</h1>
          <p className="auth-sub">Crea tu cuenta y te activamos a la brevedad.</p>

          <form onSubmit={handleSubmit} className="form-col">
            <div>
              <label className="label">Nombre</label>
              <input className="input" type="text" value={form.name} onChange={set('name')} required placeholder="Tu nombre completo" autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} required placeholder="vos@ejemplo.com" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} required placeholder="Mínimo 8 caracteres" minLength={8} />
            </div>
            <div>
              <label className="label">Nombre del local</label>
              <input className="input" type="text" value={form.shopName} onChange={set('shopName')} required placeholder="Barbería Ruiz" />
            </div>
            <div>
              <label className="label">Teléfono <span className="label-optional">(opcional)</span></label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+54 9 11 1234-5678" />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear mi cuenta gratis →'}
            </button>
          </form>
        </div>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{' '}<Link href="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
