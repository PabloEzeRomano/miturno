import { notFound } from 'next/navigation'
import { TurnoClient } from './TurnoClient'

interface Props {
  params: { id: string }
}

async function getAppt(id: string) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, name: true, durationMins: true, price: true } },
        user: { select: { id: true, name: true } },
        establishment: { select: { id: true, shopName: true, slug: true } },
      },
    })
    return appt
  } catch {
    return null
  }
}

export default async function TurnoPage({ params }: Props) {
  const appt = await getAppt(params.id)
  if (!appt) notFound()

  const initials = appt.clientName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('.')

  return (
    <TurnoClient
      appt={{
        id: appt.id,
        status: appt.status,
        startsAt: appt.startsAt.toISOString(),
        endsAt: appt.endsAt.toISOString(),
        clientInitials: initials,
        service: appt.service,
        pro: appt.user,
        establishment: appt.establishment,
      }}
    />
  )
}

export async function generateMetadata({ params }: Props) {
  const appt = await getAppt(params.id)
  if (!appt) return {}
  return { title: `Tu turno en ${appt.establishment.shopName} — miturno` }
}
