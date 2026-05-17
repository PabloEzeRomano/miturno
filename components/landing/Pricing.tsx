import Link from 'next/link'

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pricing-check">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

export function Pricing() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'

  return (
    <section id="pricing" className="section section--bg">
      <div className="container">
        <div className="pricing-card">
          <div className="pricing-glow" />

          <div className="pricing-content">
            <span className="eyebrow eyebrow--gold">PRECIO</span>
            <h2 className="pricing-h2">
              14 días gratis,<br/><em>y después lo acordamos juntos.</em>
            </h2>
            <p className="pricing-body">
              Sin tarjeta para empezar, sin contratos largos. Probás dos semanas, y si te sirve, hablamos un precio que tenga sentido para tu local. No te cobramos por turno, ni por cliente, ni por cancelación.
            </p>
            <div className="pricing-ctas">
              <Link href="/signup" className="btn btn-gold btn-lg btn-arrow">
                Crear mi cuenta gratis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <a href={`mailto:${contactEmail}`} className="btn btn-outline-light btn-lg">Escribinos</a>
            </div>
          </div>

          <ul className="pricing-list">
            {[
              { strong: 'Setup en menos de 2 minutos.', rest: ' Te creamos los servicios y horarios típicos al toque.' },
              { strong: '0% de comisión.', rest: ' Lo que cobrás es lo que cobrás. Nosotros no tocamos un peso.' },
              { strong: 'Tu link sigue vivo siempre.', rest: ' Incluso si dejás de pagar — para no perder reservas — vos simplemente no ves la agenda hasta reactivar.' },
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
