export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { searchParams } = req.nextUrl
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')
  const excludeId = searchParams.get('excludeId')
  const userId = searchParams.get('userId')

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 })
  }

  const establishment = await prisma.establishment.findUnique({ where: { slug: params.slug } })
  if (!establishment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  let targetUserId = userId
  if (!targetUserId) {
    const owner = await prisma.user.findFirst({
      where: { establishmentId: establishment.id, role: 'Owner' },
    })
    if (!owner) return NextResponse.json({ slots: [] })
    targetUserId = owner.id
  }

  const date = new Date(dateStr + 'T00:00:00')
  const slots = await getAvailableSlots(targetUserId, establishment.id, date, service.durationMins, excludeId || undefined)

  return NextResponse.json({ slots })
}
