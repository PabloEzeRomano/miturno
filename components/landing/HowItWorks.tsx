'use client'
import { useState, useEffect } from 'react'
import { useCategory } from '@/lib/theme-context'

export function HowItWorks() {
  const { appName, landingVertical } = useCategory()
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])

  return (
    <section id="how" className="section section--bg section--bordered">
      <div className="container">
        <div className="sec-intro">
          <div>
            {/*<span className="eyebrow eyebrow-gap">CÓMO FUNCIONA</span>*/}
            <h2 className="sec-heading" style={{ maxWidth: '18ch', textWrap: 'balance' } as React.CSSProperties}>
              Tres pasos, <em>y empezás a recibir reservas.</em>
            </h2>
          </div>
          <p className="sec-lead">
            Configurar {appName} toma menos que atender al primer cliente del día. Tu link queda listo y lo compartís donde quieras: Instagram, WhatsApp, o impreso en el local.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">
              01<sup>· REGISTRO</sup>
            </div>
            <h3 className="step-h3">Creá tu cuenta</h3>
            <p className="step-p">Email, contraseña, nombre del local. Listo. Ni tarjeta de crédito ni planilla larga.</p>
            <div className="step-demo">
              {[['Nombre del local', 'SHOP'], ['tumail@ejemplo.com', '@'], ['•••••••••', 'PWD']].map(([val, tag]) => (
                <div key={tag} className="step-field">
                  <span>{val}</span>
                  <span className="step-field-tag">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">
              02<sup>· SETUP</sup>
            </div>
            <h3 className="step-h3">Configurá tus servicios</h3>
            <p className="step-p">Cargás precios, duración y horarios. Bloqueás los días que estás de vacaciones. Cambios en vivo, cuando quieras.</p>
            <div className="step-demo">
              {['Corte · 30 · $3.500', 'Corte + Barba · 45 · $5.000', 'Puntas · 30 · $2.500', 'Color · 45 · $7.500'].map(t => (
                <span key={t} className="step-tag">{t}</span>
              ))}
              <span className="step-tag step-tag--gold">+ agregar</span>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">
              03<sup>· COMPARTÍ</sup>
            </div>
            <h3 className="step-h3">Mandá tu link</h3>
            <p className="step-p">Tus clientes reservan solos. Vos ves todo desde la agenda. Sin idas y vueltas por WhatsApp.</p>
            <div className="step-demo">
              <div className="step-link-bar">
                <span>{origin}/tu-local</span>
                <span className="step-copy-btn">Copiar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
