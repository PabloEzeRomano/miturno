'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRPage() {
  const [shopName, setShopName] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        const url = `${window.location.origin}/${data.slug}`
        setShopName(data.shopName || '')
        setBookingUrl(url)
      })
      .catch(() => {})
  }, [])

  if (!bookingUrl) return null

  return (
    <div className="qr-print-target" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '48px 32px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{shopName}</h1>
      <QRCodeSVG value={bookingUrl} size={240} level="H" />
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px' }}>Escaneá para reservar tu turno</p>
        <p style={{ fontSize: 13, opacity: 0.6, margin: 0, fontFamily: 'monospace' }}>{bookingUrl}</p>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => window.print()}
        style={{ marginTop: 8 }}
      >
        Imprimir
      </button>
    </div>
  )
}
