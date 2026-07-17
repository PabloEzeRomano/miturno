export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, establishmentId: true },
  })

  if (currentUser?.role !== 'Owner' || !currentUser.establishmentId) {
    return NextResponse.json({ error: 'Solo el dueño puede ver el cierre de caja.' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'Se requieren fechas from y to.' }, { status: 400 })
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      establishmentId: currentUser.establishmentId,
      status: 'completed',
      startsAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59'),
      },
    },
    include: {
      service: { select: { id: true, name: true, price: true } },
      user: { select: { id: true, name: true, commissionPct: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  // Group by staff
  const byStaff = new Map<string, {
    userId: string
    name: string
    commissionPct: number
    appointments: typeof appointments
    subtotal: number
  }>()

  for (const appt of appointments) {
    const key = appt.userId
    if (!byStaff.has(key)) {
      byStaff.set(key, {
        userId: appt.userId,
        name: appt.user.name,
        commissionPct: appt.user.commissionPct,
        appointments: [],
        subtotal: 0,
      })
    }
    const entry = byStaff.get(key)!
    entry.appointments.push(appt)
    entry.subtotal += appt.service.price
  }

  const staffRows = Array.from(byStaff.values()).map(row => ({
    userId: row.userId,
    name: row.name,
    commissionPct: row.commissionPct,
    appointments: row.appointments.map(a => ({
      id: a.id,
      clientName: a.clientName,
      startsAt: a.startsAt,
      serviceName: a.service.name,
      price: a.service.price,
    })),
    subtotal: row.subtotal,
    commissionAmount: Math.round(row.subtotal * row.commissionPct / 100),
    net: Math.round(row.subtotal * (1 - row.commissionPct / 100)),
  }))

  const grandTotal = staffRows.reduce((acc, r) => acc + r.subtotal, 0)
  const totalCommission = staffRows.reduce((acc, r) => acc + r.commissionAmount, 0)
  const totalNet = staffRows.reduce((acc, r) => acc + r.net, 0)

  return NextResponse.json({
    from,
    to,
    grandTotal,
    totalCommission,
    totalNet,
    byStaff: staffRows,
  })
}
