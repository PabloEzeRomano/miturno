import { auth } from '@/lib/auth'
import LandingContent from '@/components/landing/LandingContent'

export default async function HomePage() {
  const session = await auth()
  return <LandingContent isAuthenticated={!!session} />
}
