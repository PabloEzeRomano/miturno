'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/Brand'

type Appointment = {
  id: string
  clientName: string
  startsAt: string
  endsAt: string
  service: { name: string }
  barber: { shopName: string; slug: string }
}

function formatICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function ConfirmContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [appt, setAppt] = useState<Appointment | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/appointments/${id}`).then(r => {
      if (!r.ok) { setNotFound(true); return null }
      return r.json()
    }).then(data => { if (data) setAppt(data) })
  }, [id])

  function downloadICS() {
    if (!appt) return
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(new Date(appt.startsAt))}`,
      `DTEND:${formatICSDate(new Date(appt.endsAt))}`,
      `SUMMARY:${appt.service.name} — ${appt.barber.shopName}`,
      `DESCRIPTION:Turno en ${appt.barber.shopName}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'turno.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (notFound) return (
    <div className="confirm-not-found">
      <div className="confirm-not-found-inner">
        <p className="text-muted">Turno no encontrado.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Volver al inicio</Link>
      </div>
    </div>
  )

  if (!appt) return (
    <div className="confirm-loading">
      <p>Cargando…</p>
    </div>
  )

  const startsAt = new Date(appt.startsAt)

  return (
    <div className="confirm-page">
      <div className="confirm-box">
        <div className="confirm-logo">
          <Link href="/" className="auth-logo">
            <BrandMark size={28} />
            <Wordmark size={20} />
          </Link>
        </div>

        <div className="panel panel--text-center panel--mb-lg">
          <div className="confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <span className="eyebrow confirm-eyebrow">TURNO RESERVADO</span>
          <h1 className="confirm-h1">
            ¡Todo listo, {appt.clientName.split(' ')[0]}!
          </h1>

          <div className="confirm-detail">
            <Row label="Servicio" value={appt.service.name} />
            <Row label="Local" value={appt.barber.shopName} />
            <Row label="Fecha" value={startsAt.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} />
            <Row label="Hora" value={startsAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} mono />
          </div>

          <button className="btn btn-outline btn-full btn-mb" onClick={downloadICS}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Agregar al calendario
          </button>

          <Link href={`/${appt.barber.slug}`} className="btn btn-ghost btn-full">
            Reservar otro turno
          </Link>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="label">{label}</span>
      <span className={mono ? 'row-value row-value--mono' : 'row-value'}>{value}</span>
    </div>
  )
}

export default function ConfirmPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="confirm-loading"><p>Cargando…</p></div>}>
      <ConfirmContent slug={params.slug} />
    </Suspense>
  )
}
