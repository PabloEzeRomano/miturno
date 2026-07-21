export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const unreadOnly = searchParams.get('unread') === '1'

  if (unreadOnly) {
    const count = await prisma.notification.count({
      where: { establishmentId, read: false },
    })
    return NextResponse.json({ count })
  }

  const notifications = await prisma.notification.findMany({
    where: { establishmentId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(notifications)
}

export async function DELETE(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.deleteMany({ where: { establishmentId } })

  return NextResponse.json({ ok: true })
}
