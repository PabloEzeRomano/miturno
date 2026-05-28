import { prisma } from '@/lib/prisma'

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatSlot(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function getAvailableSlots(
  userId: string,
  establishmentId: string,
  date: Date,
  durationMins: number,
  excludeAppointmentId?: string
): Promise<string[]> {
  const dayOfWeek = date.getDay()

  const avail = await prisma.availability.findFirst({
    where: { userId, dayOfWeek, isActive: true },
  })
  if (!avail) return []

  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)

  const blocked = await prisma.blockedDate.findFirst({
    where: {
      establishmentId,
      OR: [
        { date: { gte: dateStart, lte: dateEnd }, endDate: null },
        { date: { lte: dateEnd }, endDate: { gte: dateStart } },
      ],
    },
  })
  if (blocked) return []

  const start = parseTime(avail.startTime)
  const end = parseTime(avail.endTime) - durationMins

  const slots: string[] = []
  for (let t = start; t <= end; t += durationMins) {
    slots.push(formatSlot(t))
  }

  const existing = (await prisma.appointment.findMany({
    where: {
      establishmentId,
      userId,
      startsAt: { gte: dateStart, lte: dateEnd },
      status: { not: 'cancelled' },
    },
  })).filter(a => a.id !== excludeAppointmentId)

  return slots.filter((slot) => {
    const slotStart = parseTime(slot)
    const slotEnd = slotStart + durationMins
    return !existing.some((appt) => {
      const apptStart =
        appt.startsAt.getHours() * 60 + appt.startsAt.getMinutes()
      const apptEnd = appt.endsAt.getHours() * 60 + appt.endsAt.getMinutes()
      return slotStart < apptEnd && slotEnd > apptStart
    })
  })
}
