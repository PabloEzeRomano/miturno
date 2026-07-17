export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function getOwnerEstablishment() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, establishmentId: true },
  })
  if (user?.role !== 'Owner' || !user.establishmentId) return null
  return user.establishmentId
}

export async function GET(req: NextRequest) {
  const estId = await getOwnerEstablishment()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.reminderSettings.findUnique({
    where: { establishmentId: estId },
  })

  return NextResponse.json(settings ?? { establishmentId: estId })
}

export async function PATCH(req: NextRequest) {
  const estId = await getOwnerEstablishment()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const allowedFields = [
    'waApiKey', 'waPhoneNumberId', 'googleReviewUrl',
    'cancelRescheduleEnabled', 'cancelRescheduleHoursBefore',
    'reminderEnabled', 'reminderHoursBefore',
    'reviewEnabled', 'reviewHoursAfter',
  ]

  const data: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field]
  }

  const settings = await prisma.reminderSettings.upsert({
    where: { establishmentId: estId },
    create: { establishmentId: estId, ...data },
    update: data,
  })

  return NextResponse.json(settings)
}
