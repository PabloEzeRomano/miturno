import Link from 'next/link'

export function Hero() {
  return (
    <header className="hero">
      <div className="hero-gradient" />
      <div className="barber-stripe" />

      <div className="container">
        <div className="hero-grid">
          {/* Copy */}
          <div>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" />
              <span className="eyebrow eyebrow--gold">Software para peluquerías &amp; barberías</span>
            </div>
            <h1 className="hero-h1">
              Tu peluquería,<br/><em>online en minutos.</em>
            </h1>
            <p className="hero-body">
              Una agenda simple, una página propia para que tus clientes reserven solos, y vos atendés tranquilo. Sin comisiones, sin contratos, sin apps que bajar.
            </p>
            <div className="hero-ctas">
              <Link href="/signup" className="btn btn-gold btn-lg btn-arrow">
                Crear mi cuenta gratis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <a href="#how" className="btn btn-outline-light btn-lg">Ver cómo funciona</a>
            </div>
            <div className="hero-stats">
              {[
                { num: '14 días', lbl: 'PRUEBA GRATIS' },
                { num: '2 min', lbl: 'DE SETUP' },
                { num: '0%', lbl: 'COMISIÓN POR TURNO' },
              ].map(({ num, lbl }) => (
                <div key={lbl} className="hero-stat">
                  <span className="hero-stat-num">{num}</span>
                  <span className="hero-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device mockup */}
          <div className="hero-mockup">
            <div className="hero-mockup-bg">
              <span className="hero-mockup-url">turnos.gemm-apps.com/carlos</span>
            </div>

            {/* Float top */}
            <div className="hero-float hero-float--top">
              <span className="hero-float-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              <div>
                <strong className="hero-float-title">Nuevo turno reservado</strong>
                <span className="hero-float-sub">15:15 · Mariana L.</span>
              </div>
            </div>

            {/* Phone */}
            <div className="hero-phone">
              <div className="hero-phone-notch-bar">
                <div className="hero-phone-notch" />
              </div>
              <div className="hero-phone-body">
                <div className="hero-phone-shop-row">
                  <span className="hero-phone-shop-name">Barbería <em>Ruiz</em></span>
                  <span className="hero-phone-location">Palermo</span>
                </div>
                <div className="hero-phone-section-label">Elegí tu servicio</div>
                {[
                  { nm: 'Corte', du: '30 min', pr: '$3.500', sel: false },
                  { nm: 'Corte + Barba', du: '45 min', pr: '$5.000', sel: true },
                ].map(({ nm, du, pr, sel }) => (
                  <div key={nm} className={`hero-svc-row${sel ? ' hero-svc-row--sel' : ''}`}>
                    <div>
                      <div className="hero-svc-name">{nm}</div>
                      <div className="hero-svc-dur">{du}</div>
                    </div>
                    <div className="hero-svc-price">{pr}</div>
                  </div>
                ))}
                <div className="hero-phone-section-label">Sábado 16 · Mayo</div>
                <div className="hero-slots">
                  {[
                    { t: '09:00', s: '' }, { t: '09:45', s: '' }, { t: '10:30', s: 'off' }, { t: '11:15', s: '' },
                    { t: '12:00', s: '' }, { t: '14:30', s: 'off' }, { t: '15:15', s: 'sel' }, { t: '16:00', s: '' },
                  ].map(({ t, s }) => (
                    <div key={t} className={`hero-slot${s === 'sel' ? ' hero-slot--sel' : s === 'off' ? ' hero-slot--off' : ''}`}>{t}</div>
                  ))}
                </div>
                <div className="hero-book-btn">Reservar 15:15</div>
              </div>
            </div>

            {/* Float bottom */}
            <div className="hero-float hero-float--bottom">
              <span className="hero-float-icon hero-float-icon--gold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18"/></svg>
              </span>
              <div>
                <strong className="hero-float-title">3 turnos hoy</strong>
                <span className="hero-float-sub">2 confirmados · 1 listo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
