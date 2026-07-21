export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// Public endpoint — no auth required.
// Returns appointment info without exposing clientPhone.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const appt = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: { select: { id: true, name: true, durationMins: true, price: true } },
      user: { select: { id: true, name: true } },
      establishment: { select: { id: true, shopName: true, slug: true } },
    },
  })

  if (!appt) return NextResponse.json({ error: 'Turno no encontrado.' }, { status: 404 })

  // Mask client name to initials only
  const initials = appt.clientName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('.')

  return NextResponse.json({
    id: appt.id,
    status: appt.status,
    startsAt: appt.startsAt,
    endsAt: appt.endsAt,
    clientInitials: initials,
    service: appt.service,
    pro: appt.user,
    establishment: appt.establishment,
  })
}

// PATCH — cancel or reschedule. Requires phone verification.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { phone, action, date, time } = body

  if (!phone || !action) {
    return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
  }

  const appt = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { service: true },
  })

  if (!appt) return NextResponse.json({ error: 'Turno no encontrado.' }, { status: 404 })
  if (appt.status === 'cancelled') {
    return NextResponse.json({ error: 'El turno ya fue cancelado.' }, { status: 409 })
  }

  // Normalize both phones for comparison (digits only)
  const normalize = (p: string) => p.replace(/\D/g, '')
  if (normalize(phone) !== normalize(appt.clientPhone)) {
    return NextResponse.json({ error: 'Teléfono incorrecto.' }, { status: 403 })
  }

  if (action === 'cancel') {
    const updated = await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'cancelled' },
    })
    createNotification(
      appt.establishmentId,
      'cancellation',
      `${appt.clientName} canceló su turno`,
      appt.id,
    )
    return NextResponse.json(updated)
  }

  if (action === 'reschedule') {
    if (!date || !time) {
      return NextResponse.json({ error: 'Faltan fecha y hora.' }, { status: 400 })
    }

    const startsAt = new Date(`${date}T${time}:00`)
    const endsAt = new Date(startsAt.getTime() + appt.service.durationMins * 60_000)

    const updated = await prisma.appointment.update({
      where: { id: appt.id },
      data: { startsAt, endsAt, status: 'confirmed', cancelRescheduleSent: false },
    })
    const dateStr = startsAt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    createNotification(
      appt.establishmentId,
      'reschedule',
      `${appt.clientName} reprogramó su turno para el ${dateStr} a las ${time}`,
      appt.id,
    )
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
}
