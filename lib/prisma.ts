import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
}

function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL })
}

function createPrismaClient(pool: Pool) {
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const pool = globalForPrisma.pool ?? createPool()
export const prisma = globalForPrisma.prisma ?? createPrismaClient(pool)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
