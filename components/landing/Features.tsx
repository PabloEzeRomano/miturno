export function Features() {
  return (
    <section id="features" className="section section--surface section--bordered-v">
      <div className="container">
        <div className="sec-intro">
          <div>
            <span className="eyebrow eyebrow-gap">FUNCIONES</span>
            <h2 className="sec-heading">
              Lo necesario,<br/><em>nada que sobre.</em>
            </h2>
          </div>
          <p className="sec-lead">
            Construido a partir de lo que te falta cuando tomás turnos por WhatsApp: una sola agenda viva, tu propia página, recordatorios que no se olvidan, y total control de tu calendario.
          </p>
        </div>

        <div className="bento-grid">
          {/* Agenda online */}
          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></svg>
              </div>
              <span className="badge badge-stat">24/7</span>
            </div>
            <h3 className="bento-h3">Agenda online</h3>
            <p className="bento-p">Tus clientes reservan desde el celular mientras vos cortás. Slots calculados según la duración del servicio y los turnos ya tomados.</p>
            <div className="bento-demo">
              <div className="cal-mini">
                {['', 'VIE', 'SÁB', 'DOM'].map(d => <div key={d} className="cal-mini-hdr">{d}</div>)}
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

          {/* Gestión de turnos */}
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
              <span className="badge badge-stat">+ Nuevo turno manual</span>
            </div>
          </div>

          {/* Recordatorios */}
          <div className="bento-cell">
            <div className="bento-icon-row">
              <div className="bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>
              </div>
              <span className="badge badge-soon">PRÓXIMAMENTE</span>
            </div>
            <h3 className="bento-h3">Recordatorios automáticos</h3>
            <p className="bento-p">Email al cliente 3 horas antes del turno. Botones para cancelar o reprogramar sin pasar por vos. Menos ausencias, menos llamadas.</p>
            <div className="bento-demo">
              <div className="reminder-card">
                <div className="reminder-from">DE · CORTURNO &lt;recordatorios@corturno.com&gt;</div>
                <div className="reminder-subj">Te recordamos tu turno hoy</div>
                <div className="reminder-body">Mariana, hoy a las <em>15:15</em> tenés Corte + Barba en Barbería Ruiz.</div>
                <div className="reminder-links">
                  <a href="#" className="reminder-link">Reprogramar</a>
                  <a href="#" className="reminder-link">Cancelar</a>
                </div>
              </div>
            </div>
          </div>

          {/* Tu página propia */}
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
                <div className="page-url-value">{process.env.BASE_URL}<em className="field-gold">carlos</em></div>
                <div className="page-url-meta">
                  <span>Tu URL</span><span>no se cambia</span>
                </div>
              </div>
              <div className="qr-mock" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
