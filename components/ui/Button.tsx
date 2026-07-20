import React from 'react'

type Variant = 'primary' | 'gold' | 'outline' | 'outline-light' | 'ghost' | 'danger'
type Size = 'sm' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
}

export function Button({ variant = 'primary', size, full, className, children, ...props }: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    full ? 'btn-full' : '',
    className ?? '',
  ].filter(Boolean).join(' ')
  return <button className={cls} {...props}>{children}</button>
}
