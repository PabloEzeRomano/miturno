# Corturno

Una agenda online simple para peluquerías y barberías que prefieren cortar pelo a contestar WhatsApp.

Tus clientes reservan solos desde tu link. Vos dejás de contestar "¿tenés lugar el viernes?" y recuperás horas para atender.

---

## Stack

| Área | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Frontend | React 18, CSS vanilla |
| Base de datos | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth v5 (Credentials) |
| Emails | Resend |

## Features

### Para el cliente
- **Página pública** en `[BASE_URL]/[slug]` — sin apps, sin registro
- **Booking en 4 pasos**: servicio → fecha → horario → datos de contacto
- **Confirmación** con descarga de archivo ICS (Agregar al calendario)

### Para el barbero (admin)
- **Agenda** semanal/diaria con turnos coloreados por estado
- **Nuevo turno** manual desde un drawer
- **Servicios**: CRUD con toggle de activación
- **Disponibilidad**: horarios semanales + fechas bloqueadas (vacaciones)
- **Link público** para compartir con clientes
- **Perfil**: editar datos, eliminar cuenta

### Plataforma
- **Notificaciones** al admin cuando se registra un nuevo barbero (Resend)
- **Recordatorios** de turnos (infraestructura lista, pendiente de activar)
- **Activación manual** de cuentas nuevas

## Empezar

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno y completar
cp .env.example .env.local

# Correr migraciones
npm run db:migrate

# (Opcional) Sembrar datos de demo
npm run db:seed

# Iniciar dev
npm run dev
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linter |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Push schema a DB (sin migración) |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Sembrar datos demo |
| `npm run db:studio` | Abrir Prisma Studio |

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string a PostgreSQL (pooled) |
| `DATABASE_URL_UNPOOLED` | Connection string sin pool (para migraciones) |
| `AUTH_SECRET` | Secreto de NextAuth |
| `NEXTAUTH_URL` | URL base (ej: `http://localhost:3000`) |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | WhatsApp de contacto |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email de contacto |
| `RESEND_API_KEY` | API key de Resend |

## Estructura

```
app/
├── [slug]/              # Página pública de reservas
├── admin/               # Panel admin (agenda, servicios, disponibilidad, perfil)
├── api/                 # API routes (barbers, appointments, services, etc.)
├── login/               # Login
└── signup/              # Registro

components/
├── landing/             # Componentes de landing page
└── admin/               # Sidebar, PendingActivation, NewTurnoDrawer

lib/                     # auth, prisma, availability, reminders, slugify
prisma/                  # Schema, seed, migrations
```

## Modelo de datos

- **Barber** → dueño de la peluquería (email, password, slug, isActive)
- **Service** → servicios que ofrece (nombre, duración, precio)
- **Availability** → horarios semanales por día
- **BlockedDate** → fechas bloqueadas (vacaciones, feriados)
- **Appointment** → turnos reservados (cliente, fecha, estado)

---

Un producto de [gemm-apps](https://gemm-apps.com).
