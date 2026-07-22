export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const EVO_URL = process.env.EVOLUTION_API_URL
const EVO_KEY = process.env.EVOLUTION_API_KEY

async function getEstablishmentId() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, establishmentId: true },
  })
  if (user?.role !== 'Owner' || !user.establishmentId) return null
  return user.establishmentId
}

async function evoFetch(path: string, method = 'GET', body?: object) {
  if (!EVO_URL || !EVO_KEY) return null
  const res = await fetch(`${EVO_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', apikey: EVO_KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return res.ok ? res.json() : null
}

// GET /api/wa-instance?qr=1 → get state (+ fresh QR only when qr=1)
export async function GET(req: NextRequest) {
  const estId = await getEstablishmentId()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.reminderSettings.findUnique({ where: { establishmentId: estId } })
  const instanceName = settings?.waInstance ?? process.env.EVOLUTION_INSTANCE ?? `est-${estId}`

  const stateData = await evoFetch(`/instance/connectionState/${instanceName}`)
  const state = stateData?.instance?.state ?? 'close'

  if (state === 'open') {
    return NextResponse.json({ state: 'open', instanceName })
  }

  // Only fetch/regenerate QR when explicitly requested
  if (req.nextUrl.searchParams.get('qr') === '1') {
    await evoFetch('/instance/create', 'POST', {
      instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
    })
    const connectData = await evoFetch(`/instance/connect/${instanceName}`)
    return NextResponse.json({ state: 'qr', instanceName, qr: connectData?.base64 ?? null })
  }

  return NextResponse.json({ state: 'qr', instanceName, qr: null })
}

// POST /api/wa-instance → save instance name to DB
export async function POST(req: NextRequest) {
  const estId = await getEstablishmentId()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { instanceName } = await req.json()
  await prisma.reminderSettings.upsert({
    where: { establishmentId: estId },
    create: { establishmentId: estId, waInstance: instanceName },
    update: { waInstance: instanceName },
  })
  return NextResponse.json({ ok: true })
}

// DELETE /api/wa-instance → logout instance
export async function DELETE(_req: NextRequest) {
  const estId = await getEstablishmentId()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.reminderSettings.findUnique({ where: { establishmentId: estId } })
  const instanceName = settings?.waInstance ?? `est-${estId}`

  await evoFetch(`/instance/logout/${instanceName}`, 'DELETE')
  await prisma.reminderSettings.update({
    where: { establishmentId: estId },
    data: { waInstance: null },
  })
  return NextResponse.json({ ok: true })
}
