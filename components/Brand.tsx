export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg width={Math.round(size * 0.53)} height={Math.round(size * 0.53)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/>
        <line x1="8.5" y1="15.5" x2="20" y2="4"/><line x1="15.5" y1="15.5" x2="4" y2="4"/>
        <line x1="12" y1="11" x2="14" y2="13"/>
      </svg>
    </span>
  )
}

export function Wordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className={`wordmark${light ? ' wordmark--light' : ''}`} style={{ fontSize: size }}>
      Cort<em>urno</em>
    </span>
  )
}
