'use client'
import { useCategory } from '@/lib/theme-context'

const CalendarCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <path d="M8 2v4M16 2v4"/>
    <path d="M8 15l3 2.5 5-5"/>
  </svg>
)

export function BrandMark({ size = 30 }: { size?: number }) {
  const scaled = Math.round(size * 0.53)
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <span style={{ width: scaled, height: scaled, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CalendarCheckIcon />
      </span>
    </span>
  )
}

export function Wordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  const { wordmark } = useCategory()
  return (
    <span className={`wordmark${light ? ' wordmark--light' : ''}`} style={{ fontSize: size }}>
      {wordmark.base}<em>{wordmark.italic}</em>
    </span>
  )
}
