export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCategoryDef } from '@/lib/categories'
import { ThemeProvider } from '@/lib/theme-context'
import { BookingFlow } from './BookingFlow'

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { isActive: true }, orderBy: { name: 'asc' } },
      category: true,
    },
  })
  if (!establishment) notFound()

  const users = await prisma.user.findMany({
    where: { establishmentId: establishment.id, status: 'active' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const availability = await prisma.availability.findMany({
    where: { userId: { in: users.map(u => u.id) } },
    select: { userId: true, dayOfWeek: true, isActive: true },
  })

  const blockedDates = await prisma.blockedDate.findMany({
    where: { establishmentId: establishment.id },
    select: { date: true, endDate: true },
  })

  const categorySlug = establishment.category?.slug ?? 'barberia'
  const category = getCategoryDef(categorySlug)

  return (
    <ThemeProvider category={category}>
      <div className="booking-page">
        <div className="booking-header">
          <div className="booking-header-inner">
            <span className="booking-header-eyebrow">{category.appName} · Reservá tu turno</span>
            <h1 className="booking-shop-name">{establishment.shopName}</h1>
          </div>
        </div>

        <BookingFlow
          establishmentId={establishment.id}
          slug={params.slug}
          services={establishment.services.map(s => ({ id: s.id, name: s.name, durationMins: s.durationMins, price: s.price }))}
          users={users}
          availability={availability}
          blockedDates={blockedDates.map(b => ({ date: b.date.toISOString(), endDate: b.endDate?.toISOString() || null }))}
        />
      </div>
    </ThemeProvider>
  )
}
