'use client'
import { useState, useEffect } from 'react'

type Service = { id: string; name: string; durationMins: number; price: number; isActive: boolean }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [role, setRole] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newSvc, setNewSvc] = useState({ name: '', durationMins: 30, price: 0 })
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ name: '', durationMins: 30, price: 0 })
  const [loading, setLoading] = useState(false)

  async function load() {
    const [svcRes, profileRes] = await Promise.all([
      fetch('/api/services'),
      fetch('/api/profile'),
    ])
    if (svcRes.ok) setServices(await svcRes.json())
    if (profileRes.ok) {
      const data = await profileRes.json()
      setRole(data.role || '')
    }
  }
  useEffect(() => { load() }, [])

  async function addService() {
    if (!newSvc.name) return
    setLoading(true)
    await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSvc) })
    setNewSvc({ name: '', durationMins: 30, price: 0 })
    setShowAdd(false)
    setLoading(false)
    load()
  }

  async function saveEdit(id: string) {
    await fetch(`/api/services/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) })
    setEditId(null)
    load()
  }

  async function toggleActive(svc: Service) {
    await fetch(`/api/services/${svc.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !svc.isActive }) })
    load()
  }

  const isOwner = role === 'Owner'

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-block">ADMINISTRACIÓN</span>
          <h1 className="page-title">Servicios</h1>
        </div>
        {isOwner && (
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Agregar servicio</button>
        )}
      </div>

      {isOwner && showAdd && (
        <div className="panel panel--mb">
          <h3 className="svc-add-h3">Nuevo servicio</h3>
          <div className="svc-grid">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={newSvc.name} onChange={e => setNewSvc(s => ({ ...s, name: e.target.value }))} placeholder="Corte" />
            </div>
            <div>
              <label className="label">Duración (min)</label>
              <input className="input" type="number" value={newSvc.durationMins} onChange={e => setNewSvc(s => ({ ...s, durationMins: Number(e.target.value) }))} min={5} />
            </div>
            <div>
              <label className="label">Precio ($)</label>
              <input className="input" type="number" value={newSvc.price} onChange={e => setNewSvc(s => ({ ...s, price: Number(e.target.value) }))} min={0} step={100} />
            </div>
          </div>
          <div className="flex-sm">
            <button className="btn btn-gold" onClick={addService} disabled={loading}>Guardar</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="panel panel--flush">
        <table className="data-table">
          <thead>
            <tr>
              {['Nombre', 'Duración', 'Precio', 'Estado', isOwner ? '' : null].filter(Boolean).map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(svc => (
              <tr key={svc.id}>
                {isOwner && editId === svc.id ? (
                  <>
                    <td className="td-edit"><input className="input" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} /></td>
                    <td className="td-edit"><input className="input" type="number" value={editData.durationMins} onChange={e => setEditData(d => ({ ...d, durationMins: Number(e.target.value) }))} style={{ width: 80 }} /></td>
                    <td className="td-edit"><input className="input" type="number" value={editData.price} onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))} style={{ width: 100 }} /></td>
                    <td className="td-edit" />
                    <td className="td-edit">
                      <div className="flex-sm">
                        <button className="btn btn-gold btn-sm" onClick={() => saveEdit(svc.id)}>Guardar</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 500, opacity: svc.isActive ? 1 : 0.45 }}>{svc.name}</td>
                    <td className="td-mono">{svc.durationMins} min</td>
                    <td className="td-price">${svc.price.toLocaleString('es-AR')}</td>
                    <td>
                      {isOwner ? (
                        <label className="toggle">
                          <input type="checkbox" checked={svc.isActive} onChange={() => toggleActive(svc)} />
                          <span className="toggle-track" />
                        </label>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--c-muted)' }}>{svc.isActive ? 'Activo' : 'Inactivo'}</span>
                      )}
                    </td>
                    {isOwner && (
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(svc.id); setEditData({ name: svc.name, durationMins: svc.durationMins, price: svc.price }) }}>Editar</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
