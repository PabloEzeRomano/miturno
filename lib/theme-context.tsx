'use client'
import { createContext, useContext, useMemo } from 'react'
import type { CategoryDef } from './categories'
import { getCategoryDef, themeToCssVars } from './categories'

const defaultCategory = getCategoryDef('barberia')

export const ThemeContext = createContext<CategoryDef>(defaultCategory)

export function useCategory() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ category, children }: { category: CategoryDef; children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={category}>
      <ThemeStyles theme={category.theme} />
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeFromSlugProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const category = useMemo(() => getCategoryDef(slug), [slug])
  return <ThemeProvider category={category}>{children}</ThemeProvider>
}

function ThemeStyles({ theme }: { theme: CategoryDef['theme'] }) {
  const css = useMemo(() => `:root {${themeToCssVars(theme)}}`, [theme])
  return <style>{css}</style>
}
