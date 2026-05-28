import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgendaClient } from './AgendaClient'

export default async function AgendaPage() {
  const session = await auth()
  const establishmentId = (session as { establishmentId?: string }).establishmentId!
  const establishmentSlug = (session as { establishmentSlug?: string }).establishmentSlug!

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { role: true, establishment: { select: { shopName: true } } },
  })

  const services = await prisma.service.findMany({
    where: { establishmentId, isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, durationMins: true, price: true },
  })

  const users = await prisma.user.findMany({
    where: { establishmentId, status: 'active' },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  })

  const availability = await prisma.availability.findMany({
    where: { userId: session!.user.id },
    select: { dayOfWeek: true, isActive: true },
  })

  return (
    <AgendaClient
      establishmentId={establishmentId}
      slug={establishmentSlug}
      shopName={user?.establishment?.shopName || ''}
      services={services}
      availability={availability}
      role={user?.role || 'Staff'}
      users={users}
    />
  )
}
