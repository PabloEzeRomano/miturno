import { auth } from '@/lib/auth'
import { ThemeFromSlugProvider } from '@/lib/theme-context'
import LandingContent from '@/components/landing/LandingContent'

export default async function BarberíaLanding() {
  const session = await auth()
  return (
    <ThemeFromSlugProvider slug="barberia">
      <LandingContent isAuthenticated={!!session} />
    </ThemeFromSlugProvider>
  )
}
