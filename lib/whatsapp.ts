const EVO_URL = process.env.EVOLUTION_API_URL
const EVO_KEY = process.env.EVOLUTION_API_KEY
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE

function normalize(phone: string) {
  return phone.replace(/[\s\-()+ ]/g, '')
}

export async function sendWhatsAppText(phone: string, message: string): Promise<boolean> {
  if (!EVO_URL || !EVO_KEY || !EVO_INSTANCE) {
    console.log(`[WhatsApp MOCK] → ${phone}\n${message}\n`)
    return true
  }
  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: EVO_KEY },
      body: JSON.stringify({ number: normalize(phone), text: message }),
    })
    if (!res.ok) console.error(`[Evolution] Error to ${normalize(phone)}:`, await res.text())
    return res.ok
  } catch (err) {
    console.error(`[Evolution] Network error:`, err)
    return false
  }
}

export async function sendWhatsAppTemplate(
  phone: string,
  _templateName: string,
  _languageCode: string,
  params: string[]
): Promise<boolean> {
  const [clientName, shopName, time, link] = params
  const text = `Hola ${clientName}! Tenés un turno en *${shopName}* a las ${time}.\n\nPara cancelar o reprogramar:\n${link}`
  return sendWhatsAppText(phone, text)
}
