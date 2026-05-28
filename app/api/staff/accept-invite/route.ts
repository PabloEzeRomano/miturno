export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token requerido.' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { inviteToken: token } })
  if (!user) return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 404 })
  if (user.status !== 'pending') return NextResponse.json({ error: 'Esta invitación ya fue utilizada.' }, { status: 400 })

  return NextResponse.json({ name: user.name, email: user.email })
}

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { inviteToken: token } })
  if (!user) return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 404 })
  if (user.status !== 'pending') return NextResponse.json({ error: 'Esta invitación ya fue utilizada.' }, { status: 400 })

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, status: 'active', inviteToken: null },
  })

  return NextResponse.json({ success: true })
}
