import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCategoryDef } from '@/lib/categories'
import { ThemeProvider } from '@/lib/theme-context'
import { PendingActivation } from '@/components/admin/PendingActivation'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const establishmentId = (session as { establishmentId?: string }).establishmentId
  if (!establishmentId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, establishment: { include: { category: true } } },
  })
  if (!user) redirect('/login')

  const establishment = user.establishment
  if (!establishment) redirect('/login')

  const categorySlug = establishment.category?.slug ?? 'barberia'
  const category = getCategoryDef(categorySlug)

  if (!establishment.isActive) {
    return (
      <ThemeProvider category={category}>
        <PendingActivation />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider category={category}>
      <div className="admin-shell">
        <Sidebar userName={user.name} role={user.role} />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
