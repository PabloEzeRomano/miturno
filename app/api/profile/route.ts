export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, establishment: { select: { shopName: true, slug: true, phone: true, categoryId: true } } },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { establishment, ...rest } = user
  return NextResponse.json({ ...rest, ...establishment })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  const { name, phone, shopName, categoryId } = await req.json()

  const userData: Record<string, string> = {}
  if (name !== undefined) userData.name = name

  const estData: Record<string, string> = {}
  if (phone !== undefined) estData.phone = phone
  if (shopName !== undefined || categoryId !== undefined) {
    if (currentUser?.role !== 'Owner') {
      return NextResponse.json({ error: 'Solo el dueño puede cambiar el nombre del local.' }, { status: 403 })
    }
    if (shopName !== undefined) estData.shopName = shopName
    if (categoryId !== undefined) estData.categoryId = categoryId
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: userData }),
    ...(Object.keys(estData).length ? [prisma.establishment.update({ where: { id: establishmentId }, data: estData })] : []),
  ])

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userIds = (await prisma.user.findMany({ where: { establishmentId }, select: { id: true } })).map(u => u.id)

  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { establishmentId } }),
    prisma.service.deleteMany({ where: { establishmentId } }),
    prisma.availability.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.blockedDate.deleteMany({ where: { establishmentId } }),
    prisma.recurringAppointment.deleteMany({ where: { establishmentId } }),
    prisma.user.deleteMany({ where: { establishmentId } }),
    prisma.establishment.delete({ where: { id: establishmentId } }),
  ])

  return NextResponse.json({ success: true })
}
