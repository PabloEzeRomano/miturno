export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (currentUser?.role !== 'Owner') {
    return NextResponse.json({ error: 'Solo el dueño puede eliminar personal.' }, { status: 403 })
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
  if (target.establishmentId !== establishmentId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  }

  await prisma.user.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
