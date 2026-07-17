'use client'
import { useState } from 'react'

interface ApptRow {
  id: string
  clientName: string
  startsAt: string
  serviceName: string
  price: number
}

interface StaffRow {
  userId: string
  name: string
  commissionPct: number
  appointments: ApptRow[]
  subtotal: number
  commissionAmount: number
  net: number
}

interface CajaResult {
  from: string
  to: string
  grandTotal: number
  totalCommission: number
  totalNet: number
  byStaff: StaffRow[]
}

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtTime(s: string) {
  return new Date(s).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Default: current month
function defaultRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { from, to }
}

export default function CajaPage() {
  const def = defaultRange()
  const [from, setFrom] = useState(def.from)
  const [to, setTo] = useState(def.to)
  const [result, setResult] = useState<CajaResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/caja?from=${from}&to=${to}`)
    setLoading(false)
    if (res.ok) setResult(await res.json())
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
          <h1 className="page-title">Cierre de caja</h1>
        </div>
      </div>

      {/* Date range */}
      <div className="panel panel--mb">
        <div className="caja-range">
          <div>
            <label className="label">Desde</label>
            <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading} style={{ alignSelf: 'flex-end' }}>
            {loading ? 'Cargando…' : 'Ver resumen'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Totals */}
          <div className="caja-totals panel panel--mb">
            <div className="caja-total-card">
              <span className="caja-total-label">Total facturado</span>
              <span className="caja-total-value">{fmt(result.grandTotal)}</span>
            </div>
            <div className="caja-total-card">
              <span className="caja-total-label">Comisiones</span>
              <span className="caja-total-value caja-total-value--comm">{fmt(result.totalCommission)}</span>
            </div>
            <div className="caja-total-card">
              <span className="caja-total-label">Neto del local</span>
              <span className="caja-total-value caja-total-value--net">{fmt(result.totalNet)}</span>
            </div>
          </div>

          {/* Per-staff breakdown */}
          {result.byStaff.length === 0 ? (
            <div className="panel">
              <p style={{ color: 'var(--c-muted)' }}>No hay servicios completados en ese período.</p>
            </div>
          ) : (
            result.byStaff.map(row => (
              <div key={row.userId} className="panel panel--mb">
                <div
                  className="caja-staff-header"
                  onClick={() => toggleExpand(row.userId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="caja-staff-name">{row.name}</div>
                  <div className="caja-staff-meta">
                    <span className="badge">{row.appointments.length} servicio{row.appointments.length !== 1 ? 's' : ''}</span>
                    <span>{row.commissionPct}% comisión</span>
                    <span className="caja-staff-subtotal">{fmt(row.subtotal)}</span>
                    <span style={{ color: 'var(--c-muted)', fontSize: 13 }}>
                      {expanded.has(row.userId) ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expanded.has(row.userId) && (
                  <>
                    <table className="data-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Cliente</th>
                          <th>Servicio</th>
                          <th style={{ textAlign: 'right' }}>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.appointments.map(a => (
                          <tr key={a.id}>
                            <td className="td-mono">{fmtDate(a.startsAt)}</td>
                            <td className="td-mono">{fmtTime(a.startsAt)}</td>
                            <td>{a.clientName}</td>
                            <td>{a.serviceName}</td>
                            <td className="td-price" style={{ textAlign: 'right' }}>{fmt(a.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="caja-staff-footer">
                      <div className="caja-staff-footer-row">
                        <span>Subtotal</span>
                        <span>{fmt(row.subtotal)}</span>
                      </div>
                      <div className="caja-staff-footer-row">
                        <span>Comisión ({row.commissionPct}%)</span>
                        <span className="caja-comm">−{fmt(row.commissionAmount)}</span>
                      </div>
                      <div className="caja-staff-footer-row caja-staff-footer-row--net">
                        <span>Neto al local</span>
                        <span>{fmt(row.net)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
