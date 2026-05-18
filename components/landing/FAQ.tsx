const faqs = [
  { q: '¿Mis clientes tienen que bajarse una app?', a: 'No. Abren tu link y reservan en 30 segundos desde el navegador. Funciona en cualquier celular.' },
  { q: '¿Y si me equivoco con el nombre del local?', a: 'El nombre lo cambiás cuando quieras desde tu perfil. El link público (/tu-url) queda fijo para no romper las reservas existentes.' },
  { q: '¿Puedo bloquear días de vacaciones?', a: 'Sí. Desde Disponibilidad cargás fechas bloqueadas con un motivo opcional. Esos días no aparecen disponibles para reservar.' },
  { q: '¿Qué pasa si un cliente no aparece?', a: 'Lo marcás como cancelado desde el turno y queda registrado. Cuando habilitemos recordatorios automáticos las ausencias bajan fuerte.' },
  { q: '¿Cuánto cuesta?', a: 'El precio es de $30.000 por mes. Sin contrato mínimo, sin cargos por turno ni por cliente.' },
  { q: '¿Y si dejo de pagar?', a: 'Tu agenda se bloquea para vos, pero tu link público sigue activo para no perder reservas. Cuando reactivás, todo vuelve a estar donde lo dejaste.' },
]

export function FAQ() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@corturno.com'

  return (
    <section id="faq" className="section section--surface section--bordered">
      <div className="container">
        <div className="sec-intro">
          <div>
            <span className="eyebrow eyebrow-gap">PREGUNTAS FRECUENTES</span>
            <h2 className="sec-heading">
              Lo que <em>siempre nos preguntan.</em>
            </h2>
          </div>
          <p className="sec-lead">
            Si no encontrás lo que buscás, escribinos a <a href={`mailto:${contactEmail}`} className="faq-link">{contactEmail}</a> y te contestamos el mismo día.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map(({ q, a }) => (
            <div key={q} className="faq-item">
              <h4 className="faq-q">{q}</h4>
              <p className="faq-a">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
