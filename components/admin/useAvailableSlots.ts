'use client'
import { useState, useEffect } from 'react'

export function useAvailableSlots(
  slug: string,
  date: string,
  serviceId: string,
  enabled: boolean,
  excludeId?: string,
  userId?: string,
) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date || !serviceId || !enabled) {
      setSlots([])
      return
    }
    setLoading(true)
    const params = new URLSearchParams({ date, serviceId })
    if (excludeId) params.set('excludeId', excludeId)
    if (userId) params.set('userId', userId)
    fetch(`/api/availability/${slug}?${params}`)
      .then(r => r.json())
      .then(data => {
        setSlots(data.slots || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [date, serviceId, enabled, slug, excludeId, userId])

  return { slots, loading }
}

export function calcEndTime(slot: string, durationMins: number): string {
  const [h, m] = slot.split(':').map(Number)
  const total = h * 60 + m + durationMins
  const eh = Math.floor(total / 60).toString().padStart(2, '0')
  const em = (total % 60).toString().padStart(2, '0')
  return `${eh}:${em}`
}
