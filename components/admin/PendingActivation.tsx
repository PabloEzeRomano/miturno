import { BrandMark } from '@/components/Brand'
import Link from 'next/link'

export function PendingActivation() {
  const contactWA = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '#'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'

  return (
    <div className="pending-page">
      <div className="pending-box">
        <div className="pending-logo">
          <Link href="/">
            <BrandMark size={40} />
          </Link>
        </div>

        <h1 className="pending-title">
          Tu cuenta está siendo activada
        </h1>

        <p className="pending-body">
          Te contactamos a la brevedad para coordinar el acceso. Cualquier consulta escribinos.
        </p>

        <div className="pending-actions">
          <a href={contactWA} className="btn btn-gold btn-lg">WhatsApp</a>
          <a href={`mailto:${contactEmail}`} className="btn btn-outline-light btn-lg">Email</a>
        </div>
      </div>
    </div>
  )
}
