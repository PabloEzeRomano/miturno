'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'
import type { CategoryDef } from '@/lib/categories'

interface NavProps {
  isAuthenticated: boolean
  activeTheme: string
  onThemeChange: (id: string) => void
  allThemes: CategoryDef[]
}

export function Nav({ isAuthenticated, activeTheme, onThemeChange, allThemes }: NavProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open])

  const swatches = (
    <div className="nav-theme-swatches">
      {allThemes.map(t => (
        <button
          key={t.id}
          type="button"
          className={`nav-swatch${activeTheme === t.id ? ' nav-swatch--active' : ''}`}
          style={{ background: t.theme.accent, ['--swatch-color' as string]: t.theme.accent }}
          aria-label={t.name}
          aria-pressed={activeTheme === t.id}
          onClick={() => onThemeChange(t.id)}
        />
      ))}
    </div>
  )

  return (
    <>
      <nav className="site-nav">
        <div className="container">
          <Link href="/" className="nav-logo">
            <BrandMark size={30} />
            <Wordmark size={22} />
          </Link>

          <div className="nav-links">
            <a href="#how" className="nav-link">Cómo funciona</a>
            <a href="#features" className="nav-link">Funciones</a>
            <a href="#pricing" className="nav-link">Precio</a>
            <a href="#faq" className="nav-link">Preguntas</a>
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <Link href="/admin/agenda" className="btn btn-primary">Ir al panel</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
                <Link href="/signup" className="btn btn-primary">Crear cuenta</Link>
              </>
            )}
          </div>

          <button
            className={`nav-hamburger${open ? ' nav-hamburger--open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div
        className={`nav-sidebar-overlay${open ? ' nav-sidebar-overlay--open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <div className={`nav-sidebar${open ? ' nav-sidebar--open' : ''}`}>
        <div className="nav-sidebar-inner">
          <div className="nav-sidebar-links">
            <a href="#how" className="nav-sidebar-link" onClick={() => setOpen(false)}>Cómo funciona</a>
            <a href="#features" className="nav-sidebar-link" onClick={() => setOpen(false)}>Funciones</a>
            <a href="#pricing" className="nav-sidebar-link" onClick={() => setOpen(false)}>Precio</a>
            <a href="#faq" className="nav-sidebar-link" onClick={() => setOpen(false)}>Preguntas</a>
          </div>
          {swatches}
          <div className="nav-sidebar-actions">
            {isAuthenticated ? (
              <Link href="/admin/agenda" className="btn btn-primary" onClick={() => setOpen(false)}>Ir al panel</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>Iniciar sesión</Link>
                <Link href="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
