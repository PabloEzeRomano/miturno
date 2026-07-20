type Variant = 'gold' | 'confirmed' | 'cancelled' | 'completed' | 'stat' | 'soon'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'gold', children, className }: BadgeProps) {
  return (
    <span className={['badge', `badge-${variant}`, className ?? ''].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
