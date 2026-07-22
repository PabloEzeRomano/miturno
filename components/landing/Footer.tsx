'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'
import { useCategory } from '@/lib/theme-context'

export function Footer() {
  const { appName } = useCategory()
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const homeHref = '/'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@gemm-apps.com'
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'

  return (
    <footer className="site-footer">
      <div className="footer-stripe" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={homeHref} className="footer-logo">
              <BrandMark size={30} />
              <Wordmark size={22} light />
            </Link>
            <p className="footer-tagline">
              Una agenda online simple para que tus clientes reserven sin llamar.
            </p>
          </div>

          <div>
            <h5 className="footer-col-title">Producto</h5>
            <ul className="footer-links">
              {[['#how', 'Cómo funciona'], ['#features', 'Funciones'], ['#pricing', 'Precio'], ['#faq', 'Preguntas']].map(([href, label]) => (
                <li key={href}><a href={href} className="footer-link">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="footer-col-title">Cuenta</h5>
            <ul className="footer-links">
              <li><Link href="/signup" className="footer-link">Crear cuenta</Link></li>
              <li><Link href="/login" className="footer-link">Iniciar sesión</Link></li>
              <li><Link href="/carlos" className="footer-link">Ver un local de ejemplo</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-col-title">Contacto</h5>
            <ul className="footer-links">
              <li><a href={`mailto:${contactEmail}`} className="footer-link">{contactEmail}</a></li>
              <li><a href={contactWA} className="footer-link">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 {appName} · <a href="https://gemm-apps.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>hecho con ♥ por gemm-apps</a></span>
          <span className="footer-url">{origin}</span>
        </div>
      </div>
    </footer>
  )
}
