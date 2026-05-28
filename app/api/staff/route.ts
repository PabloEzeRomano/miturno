export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await prisma.user.findMany({
    where: { establishmentId, id: { not: session.user.id } },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (currentUser?.role !== 'Owner') {
    return NextResponse.json({ error: 'Solo el dueño puede agregar personal.' }, { status: 403 })
  }

  const { name, email } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Faltan campos requeridos (nombre, email).' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email.' }, { status: 409 })
  }

  const inviteToken = randomUUID()

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: '',
      role: 'Staff',
      status: 'pending',
      inviteToken,
      establishmentId,
    },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  })

  // Send invite email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/staff-invite?token=${inviteToken}`

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    try {
      await resend.emails.send({
        from: 'Barbería <notificaciones@send.gemm-apps.com>',
        to: email,
        subject: 'Te invitaron a unirte al panel de administración',
        text: [
          `Hola ${name},`,
          '',
          `${currentUser.name} te invitó a unirte al panel de administración de su local.`,
          '',
          `Hacé clic en el siguiente link para crear tu cuenta:`,
          inviteUrl,
          '',
          'Saludos!',
        ].join('\n'),
      })
    } catch (err) {
      console.error('Failed to send invite email:', err)
    }
  } else {
    console.warn('RESEND_API_KEY not configured — invite email not sent.')
    console.log(`Invite URL: ${inviteUrl}`)
  }

  return NextResponse.json(user, { status: 201 })
}
