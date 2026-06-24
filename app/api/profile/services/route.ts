export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [allServices, userServices] = await Promise.all([
    prisma.service.findMany({ where: { establishmentId, isActive: true }, orderBy: { name: 'asc' } }),
    prisma.userService.findMany({ where: { userId: session.user.id }, select: { serviceId: true } }),
  ])

  return NextResponse.json({
    allServices,
    selectedIds: userServices.map(us => us.serviceId),
  })
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { serviceIds } = await req.json() as { serviceIds: string[] }
  if (!Array.isArray(serviceIds)) return NextResponse.json({ error: 'serviceIds must be array' }, { status: 400 })

  await prisma.userService.deleteMany({ where: { userId: session.user.id } })

  if (serviceIds.length > 0) {
    await prisma.userService.createMany({
      data: serviceIds.map(serviceId => ({ userId: session.user.id, serviceId })),
    })
  }

  return NextResponse.json({ ok: true })
}
