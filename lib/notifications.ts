import { prisma } from './prisma'

export type NotificationType = 'new_booking' | 'cancellation' | 'reschedule'

export function createNotification(
  establishmentId: string,
  type: NotificationType,
  message: string,
  appointmentId?: string,
) {
  return prisma.notification.create({
    data: { establishmentId, type, message, appointmentId: appointmentId ?? null },
  }).catch(() => {})
}
