export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const establishmentId = (session as { establishmentId?: string }).establishmentId
  const body = await req.json()

  const appt = await prisma.appointment.findUnique({ where: { id: params.id } })
  if (!appt || appt.establishmentId !== establishmentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (body.serviceId && body.date && body.time) {
    const service = await prisma.service.findUnique({ where: { id: body.serviceId } })
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 400 })

    const [h, m] = body.time.split(':').map(Number)
    const startsAt = new Date(body.date + 'T' + body.time + ':00')
    const endsAt = new Date(startsAt)
    endsAt.setMinutes(endsAt.getMinutes() + service.durationMins)

    const data: Record<string, unknown> = { serviceId: body.serviceId, startsAt, endsAt }
    if (appt.status === 'cancelled') data.status = 'confirmed'
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json(updated)
  }

  if (body.status && ['confirmed', 'completed', 'cancelled'].includes(body.status)) {
    const updated = await prisma.appointment.update({ where: { id: params.id }, data: { status: body.status } })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const appt = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      establishment: { select: { shopName: true, slug: true } },
      recurringAppointment: {
        select: {
          id: true,
          frequency: true,
          dayOfWeek: true,
          time: true,
          status: true,
        },
      },
    },
  })
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(appt)
}
