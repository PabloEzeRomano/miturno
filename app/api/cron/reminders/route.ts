export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { runReminderCron } from '@/lib/reminders'

export async function GET(req: NextRequest) {
  // Protect with a secret so only Vercel cron can call this
  const secret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = req.nextUrl.origin
  const processed = await runReminderCron(baseUrl)
  return NextResponse.json({ processed })
}
