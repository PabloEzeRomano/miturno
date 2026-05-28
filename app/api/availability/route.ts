export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const availability = await prisma.availability.findMany({ where: { userId }, orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json(availability)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { schedule } = await req.json()

  await prisma.$transaction(
    schedule.map((item: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }) =>
      prisma.availability.upsert({
        where: { userId_dayOfWeek: { userId, dayOfWeek: item.dayOfWeek } },
        update: { startTime: item.startTime, endTime: item.endTime, isActive: item.isActive },
        create: { userId, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, isActive: item.isActive },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
