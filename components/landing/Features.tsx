'use client'
import { QRCodeSVG } from 'qrcode.react'
import { useCategory } from '@/lib/theme-context'

export function Features() {
  const { appName } = useCategory()

  return (
    <section id="features" className="section section--surface section--bordered-v">
      <div className="container">
        <div className="sec-intro">
          <div>
            {/*<span className="eyebrow eyebrow-gap">FUNCIONES</span>*/}
            <h2 className="sec-heading">
              Lo necesario,<br/><em>nada que sobre.</em>
            </h2>
          </div>
          <p className="sec-lead">
            Construido a partir de lo que te falta cuando tomás turnos por WhatsApp: una sola agenda viva, tu propia página, recordatorios que no se olvidan, y total control de tu calendario.
          </p>
        </div>

        <div className="bento-grid">
          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
              </div>
              <span className="badge badge-stat">24/7</span>
            </div>
            <h3 className="bento-h3">Agenda online</h3>
            <p className="bento-p">Tus clientes reservan desde el celular mientras vos atendés. Slots calculados según la duración del servicio y los turnos ya tomados.</p>
            <div className="bento-demo">
              <div className="cal-mini">
                {['','JUE', 'VIE', 'SÁB'].map(d => <div key={d} className="cal-mini-hdr">{d}</div>)}
                <div className="cal-mini-time">09</div>
                <div className="cal-mini-appt cal-mini-appt--gold">Tomás · Corte + Barba</div>
                <div className="cal-mini-appt cal-mini-appt--ink">Mariana · Puntas</div>
                <div className="cal-mini-cell" />
                <div className="cal-mini-time">10</div>
                <div className="cal-mini-cell" />
                <div className="cal-mini-appt cal-mini-appt--green">F. Méndez · ✓</div>
                <div className="cal-mini-appt cal-mini-appt--ink">Julián · Corte</div>
              </div>
            </div>
          </div>

          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon bento-icon--gold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
              </div>
            </div>
            <h3 className="bento-h3">Gestión de turnos</h3>
            <p className="bento-p">Vista semanal y diaria, drawer de cliente con un click. Completá, cancelá o creá turnos manuales. Filtro por estado y rango de fechas.</p>
            <div className="bento-demo status-pills">
              <span className="status-pill status-pill--confirmed"><span className="status-dot status-dot--ink" />Confirmado</span>
              <span className="status-pill status-pill--completed"><span className="status-dot status-dot--green" />Completado</span>
              <span className="status-pill status-pill--cancelled"><span className="status-dot status-dot--danger" />Cancelado</span>
              <span className="badge badge-stat">+ Nuevo turno</span>
            </div>
          </div>

          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
            </div>
            <h3 className="bento-h3">Recordatorios automáticos</h3>
            <p className="bento-p">WhatsApp al cliente antes del turno. Botones para cancelar o reprogramar sin pasar por vos. Menos ausencias, menos llamadas.</p>
            <div className="bento-demo">
              <div className="reminder-card">
                <div className="reminder-from">📲 WhatsApp · {appName}</div>
                <div className="reminder-body">Mariano, hoy a las <em>15:15</em> tenés Corte + Barba en tu local.</div>
                <div className="reminder-links">
                  <a href="#" className="reminder-link">Reprogramar</a>
                  <a href="#" className="reminder-link">Cancelar</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20"/><path d="M12 2a14 14 0 0 1 0 20"/><path d="M12 2a14 14 0 0 0 0 20"/></svg>
              </div>
            </div>
            <h3 className="bento-h3">Tu página propia</h3>
            <p className="bento-p">Una URL única, simple, fácil de dictar. Sin logos de terceros, sin distracciones. Sólo el nombre de tu local y los servicios que ofrecés.</p>
            <div className="bento-demo page-url-col">
              <div className="page-url-card">
                <div className="page-url-row">
                  <span className="page-url-dot" />conexión segura · publicada
                </div>
                <div className="page-url-value">{process.env.NEXT_PUBLIC_BASE_URL}<em className="field-gold">tu-local</em></div>
                <div className="page-url-meta">
                  <span>Tu URL</span><span>no se cambia</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <QRCodeSVG value="https://miturno.gemm-apps.com" size={72} bgColor="transparent" fgColor="currentColor" />
                <span style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--f-mono)' }}>Tu propio QR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
