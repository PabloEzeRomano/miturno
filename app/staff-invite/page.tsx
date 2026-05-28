import { Suspense } from 'react'
import { BrandMark, Wordmark } from '@/components/Brand'
import StaffInviteForm from './form'

function Loading() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <BrandMark size={28} />
          <Wordmark size={20} />
        </div>
        <p style={{ textAlign: 'center', color: 'var(--c-muted)', marginTop: 24 }}>Verificando invitación…</p>
      </div>
    </div>
  )
}

export default function StaffInvitePage() {
  return (
    <Suspense fallback={<Loading />}>
      <StaffInviteForm />
    </Suspense>
  )
}
