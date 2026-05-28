'use client'
import { ThemeProvider } from '@/lib/theme-context'
import { getCategoryDef } from '@/lib/categories'

const defaultCategory = getCategoryDef('barberia')

export function RootThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider category={defaultCategory}>
      {children}
    </ThemeProvider>
  )
}
