import { auth } from '@/lib/auth'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export default async function LandingPage() {
  const session = await auth()
  const isAuthenticated = !!session

  return (
    <>
      <Nav isAuthenticated={isAuthenticated} />
      <main>
        <Hero />
        <div className="landing-strip">
          <div className="container">
            <span className="strip-label">Pensado para peluquerías de barrio &amp; barberías independientes</span>
            <span className="strip-quote"><em>«</em> Tomá turnos mientras cortás. <em>»</em></span>
          </div>
        </div>
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
