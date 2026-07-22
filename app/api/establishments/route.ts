export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { Resend } from 'resend'
import { getCategoryDef, DEFAULT_CATEGORY_SLUG } from '@/lib/categories'

const NOTIFICATION_EMAIL = 'pabloezeromano@gmail.com'

async function sendNotification(name: string, shopName: string, email: string, phone: string, slug: string, appName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping notification.')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: `${appName} <notificaciones@send.gemm-apps.com>`,
      to: NOTIFICATION_EMAIL,
      subject: `Nuevo registro — ${appName}`,
      text: [
        `Nombre: ${name}`,
        `Local: ${shopName}`,
        `Email: ${email}`,
        `Teléfono: ${phone}`,
        `Slug: ${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/${slug}`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('Failed to send signup notification:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, shopName, services, categoryId } = await req.json()

    if (!name || !email || !password || !phone || !shopName) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email.' }, { status: 409 })
    }

    let category = categoryId
      ? await prisma.category.findUnique({ where: { slug: categoryId } })
      : null

    if (!category) {
      category = await prisma.category.findFirst({ where: { slug: DEFAULT_CATEGORY_SLUG } })
    }

    if (!category) {
      return NextResponse.json({ error: 'No hay categorías disponibles. Contactá al administrador.' }, { status: 500 })
    }

    const catDef = getCategoryDef(category.slug)
    const appName = catDef.appName
    const hashedPassword = await bcrypt.hash(password, 12)

    let baseSlug = slugify(shopName)
    if (!baseSlug) baseSlug = slugify(name)
    let slug = baseSlug
    let counter = 2
    while (await prisma.establishment.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const defaultServices = catDef.defaultServices.length
      ? catDef.defaultServices
      : [{ name: 'Atención', durationMins: 30, price: 3000 }]

    const result = await prisma.$transaction(async (tx) => {
      const establishment = await tx.establishment.create({
        data: {
          shopName,
          slug,
          phone,
          categoryId: category!.id,
          isActive: false,
          services: {
            create: (services?.length ? services : defaultServices).map((s: { name: string; durationMins: number; price: number }) => ({
              name: s.name,
              durationMins: s.durationMins,
              price: s.price,
            })),
          },
        },
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'Owner',
          establishmentId: establishment.id,
        },
      })

      await tx.availability.createMany({
        data: [1, 2, 3, 4, 5, 6].map((day) => ({
          userId: user.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          isActive: true,
        })),
      })

      return establishment
    })

    sendNotification(name, shopName, email, phone, slug, appName)

    return NextResponse.json({ id: result.id, slug: result.slug }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
