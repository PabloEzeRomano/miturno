import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TrialGate } from '@/components/admin/TrialGate'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const barberId = (session as { barberId?: string }).barberId
  if (!barberId) redirect('/login')

  const barber = await prisma.barber.findUnique({ where: { id: barberId } })
  if (!barber) redirect('/login')

  if (barber.trialEndsAt < new Date() && !barber.isActive) {
    return <TrialGate />
  }

  return (
    <div className="admin-shell">
      <Sidebar barberName={barber.name} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
