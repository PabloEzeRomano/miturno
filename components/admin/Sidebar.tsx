'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BrandMark, Wordmark } from '@/components/Brand'

function getNavItems(role: string) {
  const items = [
    { href: '/admin/agenda', label: 'Agenda', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
    ) },
    { href: '/admin/services', label: 'Servicios', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
    ) },
    { href: '/admin/availability', label: 'Disponibilidad', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ) },
    { href: '/admin/profile', label: 'Perfil', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ) },
  ]
  if (role === 'Owner') {
    items.push({ href: '/admin/staff', label: 'Personal', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ) })
  }
  return items
}


export function Sidebar({ userName, role }: { userName: string; role: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navItems = getNavItems(role)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <div className="sidebar-mobile-bar">
        <Link href="/" className="sidebar-logo">
          <BrandMark size={22} />
          <Wordmark size={15} />
        </Link>
        <button
          className={`sidebar-hamburger${open ? ' sidebar-hamburger--open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
      </div>

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <BrandMark size={28} />
            <Wordmark size={18} />
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={`sidebar-link${active ? ' sidebar-link--active' : ''}`}>
                {icon}
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-name">{userName}</div>
          <button className="sidebar-logout" onClick={() => signOut({ callbackUrl: '/login' })}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay${open ? ' sidebar-overlay--open' : ''}`}
        onClick={() => setOpen(false)}
      />
    </>
  )
}
