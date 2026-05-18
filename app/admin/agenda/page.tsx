import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgendaClient } from './AgendaClient'

export default async function AgendaPage() {
  const session = await auth()
  const barberId = (session as { barberId?: string }).barberId!
  const slug = (session as { slug?: string }).slug!
  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    select: { shopName: true },
  })
  const services = await prisma.service.findMany({
    where: { barberId, isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, durationMins: true, price: true },
  })

  return (
    <AgendaClient
      barberId={barberId}
      slug={slug}
      shopName={barber?.shopName || ''}
      services={services}
    />
  )
}
