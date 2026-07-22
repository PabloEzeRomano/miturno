import { prisma } from '@/lib/prisma'
import { sendWhatsAppText, sendWhatsAppTemplate } from '@/lib/whatsapp'

function formatDate(d: Date) {
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export async function runReminderCron(baseUrl: string, windowMins = 6) {
  const now = new Date()
  const WINDOW_MS = windowMins * 60 * 1000

  const allSettings = await prisma.reminderSettings.findMany()
  console.log(`[cron] ${allSettings.length} establishment(s). now=${now.toISOString()}`)
  let processed = 0

  for (const s of allSettings) {
    const instance = s.waInstance ?? process.env.EVOLUTION_INSTANCE ?? null
    console.log(`[cron] est=${s.establishmentId} instance=${instance} cancelReschedule=${s.cancelRescheduleEnabled} reminder=${s.reminderEnabled} review=${s.reviewEnabled}`)

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
        include: { service: true, establishment: true },
      })

      console.log(`[cron] cancelReschedule: ${appts.length} turno(s) en ventana`)
      for (const appt of appts) {
        const link = `${baseUrl}/turno/${appt.id}`
        const ok = await sendWhatsAppTemplate(
          appt.clientPhone,
          'reprogramar_cancelar',
          'es_AR',
          [appt.clientName, appt.establishment.shopName, formatTime(appt.startsAt), link],
          instance
        )
        console.log(`[cron] cancelReschedule sent=${ok} to=${appt.clientPhone}`)
        if (ok) {
          await prisma.appointment.update({ where: { id: appt.id }, data: { cancelRescheduleSent: true } })
          processed++
        }
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
        include: { service: true, establishment: true },
      })

      for (const appt of appts) {
        const label = s.reminderHoursBefore === 1 ? '1 hora' : `${s.reminderHoursBefore}hs`
        const msg =
          `⏰ Recordatorio: tu turno en *${appt.establishment.shopName}* ` +
          `es en ${label}.\n` +
          `${formatDate(appt.startsAt)} a las ${formatTime(appt.startsAt)} — ${appt.service.name}.`

        const ok = await sendWhatsAppText(appt.clientPhone, msg, instance)
        if (ok) {
          await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } })
          processed++
        }
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

        const ok = await sendWhatsAppText(appt.clientPhone, msg, instance)
        if (ok) {
          await prisma.appointment.update({ where: { id: appt.id }, data: { reviewSent: true } })
          processed++
        }
      }
    }
  }

  return processed
}

export async function sendAppointmentReminder(_appointmentId: string) {
  console.log('[reminders] Legacy sendAppointmentReminder called — use runReminderCron')
}
