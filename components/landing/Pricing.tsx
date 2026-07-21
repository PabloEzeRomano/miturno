'use client'
import Link from 'next/link'
import { useCategory } from '@/lib/theme-context'

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pricing-check">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export function Pricing() {
  const { appName } = useCategory()
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'

  return (
    <section id="pricing" className="section section--bg">
      <div className="container">
        <div className="pricing-card">
          <div className="pricing-glow" />

          <div className="pricing-content">
            {/*<span className="eyebrow eyebrow--gold">PRECIO</span>*/}
            <h2 className="pricing-h2">
              Simple, transparente,<br/><em>sin sorpresas.</em>
            </h2>
            <p className="pricing-body">
              Sin contratos largos ni costos por turno. Un precio fijo mensual para que puedas enfocarte en lo tuyo.
            </p>
            <div className="pricing-ctas">
              <Link href="/signup" className="btn btn-gold btn-lg btn-arrow">
                Crear mi cuenta
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <a href={`https://wa.me/${contactWA}`} className="btn btn-outline-light btn-lg">Escribinos</a>
            </div>
          </div>

          <ul className="pricing-list">
            {[
              { strong: 'Precio fijo de $30.000 por mes.', rest: ' Sin comisiones, sin costos ocultos.' },
              { strong: '0% de comisión.', rest: ' Lo que cobrás es tuyo. Nosotros no tocamos un peso.' },
              { strong: 'Tu link siempre activo.', rest: ' Si dejás de pagar, vos no ves la agenda — pero tus clientes siguen pudiendo reservar.' },
              { strong: 'Soporte por WhatsApp.', rest: ' Te respondemos rápido, en castellano, sin formularios.' },
            ].map(({ strong, rest }) => (
              <li key={strong} className="pricing-item">
                <CheckIcon />
                <span><strong>{strong}</strong>{rest}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
