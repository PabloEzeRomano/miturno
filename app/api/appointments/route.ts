export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    const { establishmentId, serviceId, clientName, clientPhone, clientEmail, date, time, userId: bodyUserId } = await req.json()

    if (!establishmentId || !serviceId || !clientName || !clientPhone || !date || !time) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) return NextResponse.json({ error: 'Servicio no encontrado.' }, { status: 404 })

    const [h, m] = time.split(':').map(Number)
    const startsAt = new Date(`${date}T${time}:00`)
    const endsAt = new Date(startsAt.getTime() + service.durationMins * 60 * 1000)

    // Use provided userId (admin multi-user), session user, or fallback to Owner
    const finalUserId = bodyUserId || userId || (await prisma.user.findFirst({
      where: { establishmentId, role: 'Owner' },
      select: { id: true },
    }))!.id

    const appt = await prisma.appointment.create({
      data: {
        establishmentId,
        userId: finalUserId,
        serviceId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        startsAt,
        endsAt,
      },
    })

    const dateStr = startsAt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = startsAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
    createNotification(
      establishmentId,
      'new_booking',
      `Nueva reserva: ${clientName} — ${service.name} el ${dateStr} a las ${timeStr}`,
      appt.id,
    )

    return NextResponse.json(appt, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const filterUserId = searchParams.get('userId')

  const where: Record<string, unknown> = { establishmentId }
  if (status && status !== 'all') where.status = status
  if (from) where.startsAt = { ...(where.startsAt as object || {}), gte: new Date(from) }
  if (to) where.startsAt = { ...(where.startsAt as object || {}), lte: new Date(to) }

  // Staff only see their own appointments
  if (currentUser?.role !== 'Owner') {
    where.userId = session.user.id
  } else if (filterUserId) {
    where.userId = filterUserId
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true },
    orderBy: { startsAt: 'asc' },
  })

  return NextResponse.json(appointments)
}
