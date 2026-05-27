'use client'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

export function Footer() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'

  return (
    <footer className="site-footer">
      <div className="footer-stripe" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <BrandMark size={30} />
              <Wordmark size={22} light />
            </Link>
            <p className="footer-tagline">
              Una agenda online simple para peluquerías y barberías que prefieren cortar pelo a contestar WhatsApp.
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
          <span>© 2026 Corturno · un producto de gemm·apps</span>
          <span className="footer-url">{process.env.BASE_URL}</span>
        </div>
      </div>
    </footer>
  )
}
