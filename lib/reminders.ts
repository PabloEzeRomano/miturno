import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'
import { safeDecrypt } from '@/lib/crypto'

function formatDate(d: Date) {
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export async function runReminderCron(baseUrl: string) {
  const now = new Date()
  const WINDOW_MS = 6 * 60 * 1000 // ±6 min; run cron every ≤10 min

  const allSettings = await prisma.reminderSettings.findMany()
  let processed = 0

  for (const s of allSettings) {
    const decryptedKey = safeDecrypt(s.waApiKey)
    const creds = decryptedKey && s.waPhoneNumberId
      ? { waApiKey: decryptedKey, waPhoneNumberId: s.waPhoneNumberId }
      : null

    // 1. Cancel/reschedule reminder (X hours before)
    if (s.cancelRescheduleEnabled) {
      const hoursMs = s.cancelRescheduleHoursBefore * 3_600_000
      const appts = await prisma.appointment.findMany({
        where: {
          establishmentId: s.establishmentId,
          status: 'confirmed',
          cancelRescheduleSent: false,
          startsAt: {
            gte: new Date(now.getTime() + hoursMs - WINDOW_MS),
            lte: new Date(now.getTime() + hoursMs + WINDOW_MS),
          },
        },
        include: { service: true, establishment: true, user: { select: { name: true } } },
      })

      for (const appt of appts) {
        const link = `${baseUrl}/turno/${appt.id}`
        const msg =
          `Hola ${appt.clientName}! 👋\n` +
          `Tenés un turno en *${appt.establishment.shopName}* ` +
          `el ${formatDate(appt.startsAt)} a las ${formatTime(appt.startsAt)}.\n` +
          `Servicio: ${appt.service.name} con ${appt.user.name}.\n\n` +
          `Para cancelar o reprogramar:\n${link}`

        await sendWhatsAppText(appt.clientPhone, msg, creds)
        await prisma.appointment.update({ where: { id: appt.id }, data: { cancelRescheduleSent: true } })
        processed++
      }
    }

    // 2. Appointment reminder (X hours before)
    if (s.reminderEnabled) {
      const hoursMs = s.reminderHoursBefore * 3_600_000
      const appts = await prisma.appointment.findMany({
        where: {
          establishmentId: s.establishmentId,
          status: 'confirmed',
          reminderSent: false,
          startsAt: {
            gte: new Date(now.getTime() + hoursMs - WINDOW_MS),
            lte: new Date(now.getTime() + hoursMs + WINDOW_MS),
          },
        },
        include: { service: true, establishment: true, user: { select: { name: true } } },
      })

      for (const appt of appts) {
        const label = s.reminderHoursBefore === 1 ? '1 hora' : `${s.reminderHoursBefore}hs`
        const msg =
          `⏰ Recordatorio: tu turno en *${appt.establishment.shopName}* ` +
          `es en ${label}.\n` +
          `${formatDate(appt.startsAt)} a las ${formatTime(appt.startsAt)} — ${appt.service.name}.`

        await sendWhatsAppText(appt.clientPhone, msg, creds)
        await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } })
        processed++
      }
    }

    // 3. Review request (X hours after)
    if (s.reviewEnabled && s.googleReviewUrl) {
      const hoursMs = s.reviewHoursAfter * 3_600_000
      const appts = await prisma.appointment.findMany({
        where: {
          establishmentId: s.establishmentId,
          status: { in: ['confirmed', 'completed'] },
          reviewSent: false,
          startsAt: {
            gte: new Date(now.getTime() - hoursMs - WINDOW_MS),
            lte: new Date(now.getTime() - hoursMs + WINDOW_MS),
          },
        },
        include: { establishment: true },
      })

      for (const appt of appts) {
        const msg =
          `¡Gracias por visitarnos, ${appt.clientName}! 💈\n` +
          `Nos alegraría que nos dejes una reseña:\n${s.googleReviewUrl}`

        await sendWhatsAppText(appt.clientPhone, msg, creds)
        await prisma.appointment.update({ where: { id: appt.id }, data: { reviewSent: true } })
        processed++
      }
    }
  }

  return processed
}

// Legacy compat
export async function sendAppointmentReminder(_appointmentId: string) {
  console.log('[reminders] Legacy sendAppointmentReminder called — use runReminderCron')
}
