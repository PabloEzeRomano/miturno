export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocked = await prisma.blockedDate.findUnique({ where: { id: params.id } })
  if (!blocked || blocked.establishmentId !== establishmentId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.blockedDate.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
