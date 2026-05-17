export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookingFlow } from './BookingFlow'

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const barber = await prisma.barber.findUnique({
    where: { slug: params.slug },
    include: { services: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  })
  if (!barber) notFound()

  return (
    <div className="booking-page">
      <div className="booking-header">
        <div className="booking-header-inner">
          <span className="booking-header-eyebrow">Reservá tu turno</span>
          <h1 className="booking-shop-name">{barber.shopName}</h1>
        </div>
      </div>

      <BookingFlow
        barberId={barber.id}
        slug={params.slug}
        services={barber.services.map(s => ({ id: s.id, name: s.name, durationMins: s.durationMins, price: s.price }))}
      />
    </div>
  )
}
