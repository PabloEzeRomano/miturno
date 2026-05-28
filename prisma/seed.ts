import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'
import { getAllCategoryDefs } from '../lib/categories'

config()
config({ path: '.env.local', override: true })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const categoryDefs = getAllCategoryDefs()

  for (const cat of categoryDefs) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        active: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        active: true,
      },
    })
  }

  const barberCategory = await prisma.category.findUnique({ where: { slug: 'barberia' } })

  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const establishment = await prisma.establishment.upsert({
    where: { slug: 'carlos' },
    update: {},
    create: {
      shopName: 'Barbería Ruiz',
      slug: 'carlos',
      phone: '+54 9 11 1234-5678',
      categoryId: barberCategory!.id,
      isActive: true,
      services: {
        create: [
          { name: 'Corte', durationMins: 30, price: 3500 },
          { name: 'Corte + Barba', durationMins: 45, price: 5000 },
          { name: 'Puntas', durationMins: 30, price: 2500 },
          { name: 'Full Color', durationMins: 45, price: 7500 },
        ],
      },
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'carlos@corturno.com' },
    update: { establishmentId: establishment.id },
    create: {
      name: 'Carlos Ruiz',
      email: 'carlos@corturno.com',
      password: hashedPassword,
      role: 'Owner',
      establishmentId: establishment.id,
    },
  })

  await prisma.availability.deleteMany({ where: { userId: owner.id } })
  await prisma.availability.createMany({
    data: [1, 2, 3, 4, 5, 6].map((day) => ({
      userId: owner.id,
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '19:00',
      isActive: true,
    })),
  })

  console.log('Seeded categories:', categoryDefs.map(c => c.slug).join(', '))
  console.log('Seeded establishment:', establishment.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
