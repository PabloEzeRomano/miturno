export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return 200 to avoid leaking which emails exist
    if (!user) return NextResponse.json({ ok: true })

    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const baseUrl = new URL(req.url).origin
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      try {
        await resend.emails.send({
          from: 'miturno <notificaciones@send.gemm-apps.com>',
          to: email,
          subject: 'Recuperar contraseña — miturno',
          text: [
            `Hola ${user.name},`,
            '',
            'Recibimos una solicitud para recuperar tu contraseña.',
            'Hacé clic en el siguiente enlace para crear una nueva (válido por 1 hora):',
            '',
            resetUrl,
            '',
            'Si no solicitaste esto, podés ignorar este email.',
          ].join('\n'),
        })
      } catch (err) {
        console.error('Failed to send reset email:', err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
