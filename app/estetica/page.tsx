import { auth } from '@/lib/auth'
import { ThemeFromSlugProvider } from '@/lib/theme-context'
import LandingContent from '@/components/landing/LandingContent'

export default async function EsteticaLanding() {
  const session = await auth()
  return (
    <ThemeFromSlugProvider slug="estetica">
      <LandingContent isAuthenticated={!!session} />
    </ThemeFromSlugProvider>
  )
}
