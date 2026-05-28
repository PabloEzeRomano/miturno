'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'
import { useCategory } from '@/lib/theme-context'
import { getAllCategoryDefs } from '@/lib/categories'
import type { CategoryDef } from '@/lib/categories'

const allCategories = getAllCategoryDefs()

interface Service {
  name: string
  durationMins: number
  price: number
}

export default function SignupPage() {
  const router = useRouter()
  const { appName } = useCategory()
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef>(allCategories[0])
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shopName: '' })
  const [services, setServices] = useState<Service[]>(selectedCategory.defaultServices.map(s => ({ ...s })))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function selectCategory(cat: CategoryDef) {
    setSelectedCategory(cat)
    setServices(cat.defaultServices.map(s => ({ ...s })))
  }

  const step1Valid =
    form.name.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 8 &&
    form.phone.trim() !== '' &&
    form.shopName.trim() !== ''

  function updateService(index: number, field: keyof Service, value: string | number) {
    setServices(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  function addService() {
    setServices(prev => [...prev, { name: '', durationMins: 30, price: 0 }])
  }

  function removeService(index: number) {
    setServices(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/establishments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, categoryId: selectedCategory.id, services }),
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
          <div className="step-bar" style={{ marginBottom: 28 }}>
            <div className={`step-pip ${step >= 1 ? 'step-pip--active' : ''}`} />
            <div className={`step-pip ${step >= 2 ? 'step-pip--active' : ''}`} />
          </div>

          {step === 1 && (
            <div>
              <h1 className="auth-title">Creá tu cuenta</h1>
              <p className="auth-sub">Completá tus datos personales para empezar.</p>

              <form
                onSubmit={(e) => { e.preventDefault(); setStep(2) }}
                className="form-col"
              >
                <div>
                  <label className="label">Rubro</label>
                  <div className="category-picker">
                    {allCategories.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => selectCategory(cat)}
                        className={`category-btn${selectedCategory.id === cat.id ? ' category-btn--sel' : ''}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Nombre completo</label>
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
                  <label className="label">Teléfono</label>
                  <input className="input" type="tel" value={form.phone} onChange={set('phone')} required placeholder="+54 9 11 1234-5678" />
                </div>
                <div>
                  <label className="label">Nombre del local</label>
                  <input className="input" type="text" value={form.shopName} onChange={set('shopName')} required placeholder="Nombre de tu local" />
                </div>

                <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={!step1Valid}>
                  Continuar →
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="eyebrow">PASO 2 DE 2</span>
              <h2 className="auth-title" style={{ fontSize: 26, marginTop: 6 }}>Configurá tus servicios</h2>
              <p className="auth-sub" style={{ marginBottom: 24 }}>
                Estos son los servicios con los que vas a arrancar. Podés editarlos en cualquier momento.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="svc-table">
                  <div className="svc-row svc-head" aria-hidden="true">
                    <span className="label">Nombre</span>
                    <span className="label">Duración</span>
                    <span className="label">Precio</span>
                    <span />
                  </div>

                  {services.map((svc, i) => (
                    <div key={i} className="svc-row">
                      <input
                        className="input"
                        type="text"
                        value={svc.name}
                        onChange={(e) => updateService(i, 'name', e.target.value)}
                        placeholder="Nombre del servicio"
                      />
                      <div className="input-affix has-suf">
                        <input
                          className="input"
                          type="number"
                          value={svc.durationMins}
                          onChange={(e) => updateService(i, 'durationMins', Number(e.target.value))}
                          min={15}
                          max={240}
                        />
                        <span className="suf">min</span>
                      </div>
                      <div className="input-affix has-pre">
                        <span className="pre">$</span>
                        <input
                          className="input"
                          type="number"
                          value={svc.price}
                          onChange={(e) => updateService(i, 'price', Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      {services.length > 1 && (
                        <button type="button" className="svc-del" aria-label="Eliminar servicio" onClick={() => removeService(i)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="svc-add-row">
                    <button type="button" className="btn-add" onClick={addService}>
                      <span className="plus">+</span>
                      Agregar servicio
                    </button>
                  </div>
                </div>

                {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}

                <div className="svc-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Volver
                  </button>
                  <button type="submit" className="btn btn-gold" disabled={loading}>
                    {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{' '}<Link href="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
