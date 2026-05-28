export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const establishment = await prisma.establishment.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { isActive: true }, orderBy: { name: 'asc' } },
      category: true,
    },
  })
  if (!establishment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(establishment)
}
