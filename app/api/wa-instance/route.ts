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

// GET /api/wa-instance → returns { state, instanceName }
export async function GET(_req: NextRequest) {
  const estId = await getEstablishmentId()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Always use est-{estId} for the UI — never fall back to EVOLUTION_INSTANCE
  const instanceName = `est-${estId}`
  console.log(`[wa-instance] GET estId=${estId} instanceName=${instanceName}`)

  const stateData = await evoFetch(`/instance/connectionState/${instanceName}`)
  const state = stateData?.instance?.state ?? 'close'
  console.log(`[wa-instance] state=${state}`)

  return NextResponse.json({ state: state === 'open' ? 'open' : 'close', instanceName })
}

// POST /api/wa-instance { action: 'create' | 'pairingCode', phone? }
export async function POST(req: NextRequest) {
  const estId = await getEstablishmentId()
  if (!estId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const instanceName = `est-${estId}`
  console.log(`[wa-instance] POST action=${body.action} instanceName=${instanceName}`)

  if (body.action === 'create') {
    const data = await evoFetch('/instance/create', 'POST', {
      instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: false,
    })
    console.log(`[wa-instance] create result:`, JSON.stringify(data))
    return NextResponse.json({ ok: true, instanceName })
  }

  if (body.action === 'pairingCode') {
    const phone = '549' + String(body.phone).replace(/[\s\-()+ ]/g, '')
    console.log(`[wa-instance] requesting pairing code for phone=${phone}`)
    const data = await evoFetch(`/instance/pairingCode/${instanceName}`, 'POST', { phoneNumber: phone })
    console.log(`[wa-instance] pairingCode result:`, JSON.stringify(data))
    return NextResponse.json({ code: data?.code ?? null })
  }

  // save instance to DB
  if (body.action === 'save') {
    await prisma.reminderSettings.upsert({
      where: { establishmentId: estId },
      create: { establishmentId: estId, waInstance: instanceName },
      update: { waInstance: instanceName },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
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
