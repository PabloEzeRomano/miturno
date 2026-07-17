// WhatsApp Business Cloud API sender.
// Production: set waApiKey + waPhoneNumberId in ReminderSettings and use pre-approved templates.
// Mock mode: logs message to console, returns true.

interface WACredentials {
  waApiKey: string
  waPhoneNumberId: string
}

export async function sendWhatsAppText(
  phone: string,
  message: string,
  creds: WACredentials | null
): Promise<boolean> {
  if (!creds?.waApiKey || !creds?.waPhoneNumberId) {
    console.log(`[WhatsApp MOCK] → ${phone}\n${message}\n`)
    return true
  }

  // Normalize phone: remove spaces/dashes, ensure country code
  const normalized = phone.replace(/[\s\-()]/g, '')

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${creds.waPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.waApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalized,
          type: 'text',
          text: { body: message },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error(`[WhatsApp] Error sending to ${normalized}:`, err)
      return false
    }
    return true
  } catch (err) {
    console.error(`[WhatsApp] Network error:`, err)
    return false
  }
}
