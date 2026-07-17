// SMS sender. Supports TextBelt (testing) and Twilio (production).
// TextBelt free tier: 1 SMS/day with key "textbelt".
// Twilio: set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER in env.

async function sendViaTwilio(to: string, message: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return false

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: message }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error(`[SMS/Twilio] Error sending to ${to}:`, err)
    return false
  }
  return true
}

async function sendViaTextBelt(to: string, message: string): Promise<boolean> {
  const key = process.env.TEXTBELT_KEY || 'textbelt' // 'textbelt' = 1 free/day
  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: to, message, key }),
  })
  if (!res.ok) {
    console.error(`[SMS/TextBelt] HTTP error ${res.status}`)
    return false
  }
  const data = await res.json() as { success: boolean; error?: string; quotaRemaining?: number }
  if (!data.success) {
    console.error(`[SMS/TextBelt] Error:`, data.error)
    return false
  }
  console.log(`[SMS/TextBelt] sent=true quotaRemaining=${data.quotaRemaining}`)
  return true
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // Normalize: digits only with + for international
  const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`

  // Try Twilio first if configured
  if (process.env.TWILIO_ACCOUNT_SID) {
    return sendViaTwilio(normalized, message)
  }

  // Fall back to TextBelt
  return sendViaTextBelt(normalized, message)
}
