export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { Resend } from 'resend'

const NOTIFICATION_EMAIL = 'pabloezeromano@gmail.com'

async function sendNotification(name: string, shopName: string, email: string, phone: string | null, slug: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping notification.')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'Corturno <notificaciones@send.gemm-apps.com>',
      to: NOTIFICATION_EMAIL,
      subject: 'Nuevo barbero registrado — Corturno',
      text: [
        `Nombre: ${name}`,
        `Local: ${shopName}`,
        `Email: ${email}`,
        `Teléfono: ${phone || 'no ingresado'}`,
        `Slug: turnos.gemm-apps.com/${slug}`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('Failed to send signup notification:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, shopName } = await req.json()

    if (!name || !email || !password || !shopName) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    const existing = await prisma.barber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let baseSlug = slugify(shopName)
    if (!baseSlug) baseSlug = slugify(name)
    let slug = baseSlug
    let counter = 2
    while (await prisma.barber.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const barber = await prisma.$transaction(async (tx) => {
      const b = await tx.barber.create({
        data: {
          name,
          email,
          password: hashedPassword,
          slug,
          shopName,
          phone: phone || null,
          isActive: false,
          services: {
            create: [
              { name: 'Corte', durationMins: 30, price: 3500 },
              { name: 'Corte + Barba', durationMins: 45, price: 5000 },
              { name: 'Puntas', durationMins: 30, price: 2500 },
              { name: 'Full Color', durationMins: 45, price: 7500 },
            ],
          },
          availability: {
            create: [1, 2, 3, 4, 5, 6].map((day) => ({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '19:00',
              isActive: true,
            })),
          },
        },
      })
      return b
    })

    sendNotification(name, shopName, email, phone, slug)

    return NextResponse.json({ id: barber.id, slug: barber.slug }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
