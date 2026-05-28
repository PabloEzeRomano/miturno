export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await prisma.blockedDate.findMany({ where: { establishmentId }, orderBy: { date: 'asc' } })
  return NextResponse.json(blocked)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { date, endDate, reason } = await req.json()
  if (!date) return NextResponse.json({ error: 'Fecha requerida.' }, { status: 400 })
  if (endDate && new Date(endDate) < new Date(date)) {
    return NextResponse.json({ error: 'La fecha hasta debe ser posterior a la fecha desde.' }, { status: 400 })
  }

  const blocked = await prisma.blockedDate.create({
    data: {
      establishmentId,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      reason: reason || null,
    },
  })
  return NextResponse.json(blocked, { status: 201 })
}
