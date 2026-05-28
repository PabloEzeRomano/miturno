import { auth } from '@/lib/auth'
import { ThemeFromSlugProvider } from '@/lib/theme-context'
import LandingContent from '@/components/landing/LandingContent'

export default async function HairImplantsLanding() {
  const session = await auth()
  return (
    <ThemeFromSlugProvider slug="hairimplants">
      <LandingContent isAuthenticated={!!session} />
    </ThemeFromSlugProvider>
  )
}
