'use client'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

export function TrialGate() {
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'

  return (
    <div className="trial-page">
      <div className="trial-box">
        <div className="trial-logo">
          <Link href="/" className="auth-logo">
            <BrandMark size={36} />
            <Wordmark size={24} light />
          </Link>
        </div>

        <span className="trial-eyebrow">PERÍODO DE PRUEBA FINALIZADO</span>

        <h1 className="trial-title">
          Tu período de prueba<br/><em>venció.</em>
        </h1>

        <p className="trial-body">
          Tu link público sigue activo y tus clientes pueden seguir reservando. Para acceder a la agenda y gestionar tus turnos, contactanos para activar tu cuenta.
        </p>

        <div className="trial-btns">
          <a href={contactWA} className="btn btn-gold btn-lg">Activar por WhatsApp</a>
          <a href={`mailto:${contactEmail}`} className="btn btn-outline-light btn-lg">Escribir por email</a>
        </div>

        <p className="trial-note">
          Tu agenda y datos están seguros. No se eliminó nada.
        </p>
      </div>
    </div>
  )
}
