import { auth } from '@/lib/auth'
import { ThemeFromSlugProvider } from '@/lib/theme-context'
import LandingContent from '@/components/landing/LandingContent'

export default async function ClinicaLanding() {
  const session = await auth()
  return (
    <ThemeFromSlugProvider slug="clinica">
      <LandingContent isAuthenticated={!!session} />
    </ThemeFromSlugProvider>
  )
}
