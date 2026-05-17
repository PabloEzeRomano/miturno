import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/prisma/client'

config()
config({ path: '.env.local', override: true })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('demo1234', 12)
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  const barber = await prisma.barber.upsert({
    where: { email: 'carlos@corturno.com' },
    update: {},
    create: {
      name: 'Carlos Ruiz',
      email: 'carlos@corturno.com',
      password: hashedPassword,
      slug: 'carlos',
      shopName: 'Barbería Ruiz',
      trialEndsAt,
      isActive: true,
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

  console.log('Seeded barber:', barber.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
