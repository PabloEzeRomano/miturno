export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const services = await prisma.service.findMany({ where: { establishmentId }, orderBy: { name: 'asc' } })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (currentUser?.role !== 'Owner') {
    return NextResponse.json({ error: 'Solo el dueño puede modificar servicios.' }, { status: 403 })
  }

  const { name, durationMins, price } = await req.json()
  if (!name || !durationMins || price === undefined) {
    return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: { establishmentId, name, durationMins: Number(durationMins), price: Number(price) },
  })
  return NextResponse.json(service, { status: 201 })
}
