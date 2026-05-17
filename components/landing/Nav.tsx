'use client'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

export function Nav() {
  return (
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
          <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
          <Link href="/signup" className="btn btn-primary">Crear cuenta</Link>
        </div>
      </div>
    </nav>
  )
}
