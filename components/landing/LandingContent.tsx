'use client'
import { Nav } from './Nav'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { Features } from './Features'
import { Pricing } from './Pricing'
import { FAQ } from './FAQ'
import { Footer } from './Footer'

export default function LandingContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <>
      <Nav isAuthenticated={isAuthenticated} />
      <main>
        <Hero />
        {/*<div className="landing-strip">
          <div className="container">
            <span className="strip-label">Pensado para tu negocio</span>
            <span className="strip-quote"><em>«</em> Tomá turnos mientras atendés. <em>»</em></span>
          </div>
        </div>*/}
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
