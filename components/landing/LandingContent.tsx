'use client'
import { useState } from 'react'
import { getCategoryDef, getAllCategoryDefs } from '@/lib/categories'
import { ThemeProvider } from '@/lib/theme-context'
import { Nav } from './Nav'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { Features } from './Features'
import { Pricing } from './Pricing'
import { FAQ } from './FAQ'
import { Footer } from './Footer'

const allThemes = getAllCategoryDefs()

export default function LandingContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [themeId, setThemeId] = useState('barberia')
  const category = getCategoryDef(themeId)

  return (
    <ThemeProvider category={category}>
      <Nav isAuthenticated={isAuthenticated} activeTheme={themeId} onThemeChange={setThemeId} allThemes={allThemes} />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </ThemeProvider>
  )
}
