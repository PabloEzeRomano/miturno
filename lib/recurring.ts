import { prisma } from '@/lib/prisma'

type RecurringRule = {
  establishmentId: string
  userId: string
  serviceId: string
  clientName: string
  clientPhone: string
  clientEmail?: string | null
  frequency: 'weekly' | 'biweekly'
  dayOfWeek: number
  time: string
  startDate: Date
  endDate?: Date | null
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function computeRecurringDates(rule: RecurringRule, untilDate: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(rule.startDate)

  while (current <= untilDate) {
    if (current.getDay() === rule.dayOfWeek) {
      const weeksDiff = Math.floor(
        (current.getTime() - rule.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      )
      if (rule.frequency === 'weekly' || (rule.frequency === 'biweekly' && weeksDiff % 2 === 0)) {
        const d = new Date(current)
        d.setHours(0, 0, 0, 0)
        dates.push(d)
      }
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export async function generateAppointmentInstances(
  rule: RecurringRule & { recurringAppointmentId: string },
  untilDate: Date,
): Promise<number> {
  const service = await prisma.service.findUnique({ where: { id: rule.serviceId } })
  if (!service) throw new Error('Service not found')

  const dates = computeRecurringDates(rule, untilDate)
  const [h, m] = rule.time.split(':').map(Number)
  let created = 0

  for (const date of dates) {
    const startsAt = new Date(date)
    startsAt.setHours(h, m, 0, 0)
    const endsAt = new Date(startsAt.getTime() + service.durationMins * 60 * 1000)

    if (startsAt < new Date()) continue

    const existing = await prisma.appointment.findFirst({
      where: {
        establishmentId: rule.establishmentId,
        OR: [
          {
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
            status: { not: 'cancelled' },
          },
          {
            startsAt,
            recurringAppointmentId: rule.recurringAppointmentId,
          },
        ],
      },
    })
    if (existing) continue

    const dayOfWeek = date.getDay()
    const avail = await prisma.availability.findFirst({
      where: { userId: rule.userId, dayOfWeek, isActive: true },
    })
    if (!avail) continue

    const slotEnd = parseTime(rule.time) + service.durationMins
    const availEnd = parseTime(avail.endTime)
    if (parseTime(rule.time) < parseTime(avail.startTime) || slotEnd > availEnd) continue

    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    const blocked = await prisma.blockedDate.findFirst({
      where: {
        establishmentId: rule.establishmentId,
        OR: [
          { date: { gte: dateStart, lte: dateEnd }, endDate: null },
          { date: { lte: dateEnd }, endDate: { gte: dateStart } },
        ],
      },
    })
    if (blocked) continue

    await prisma.appointment.create({
      data: {
        establishmentId: rule.establishmentId,
        userId: rule.userId,
        serviceId: rule.serviceId,
        clientName: rule.clientName,
        clientPhone: rule.clientPhone,
        clientEmail: rule.clientEmail || null,
        startsAt,
        endsAt,
        recurringAppointmentId: rule.recurringAppointmentId,
      },
    })
    created++
  }

  return created
}

export async function deleteFutureInstances(recurringAppointmentId: string) {
  await prisma.appointment.deleteMany({
    where: {
      recurringAppointmentId,
      startsAt: { gte: new Date() },
    },
  })
}

const MONTHS_TO_GENERATE = 6

export { MONTHS_TO_GENERATE }
