# Mercado Digital de Siguatepeque

Directorio de negocios de Siguatepeque. Repo propio. El público escribe por WhatsApp y recoge en el negocio. El operador publica fichas; el dueño del negocio entra con el login unificado. Registro básico gratis; inscripción destacada L. 1,500 al año.

Dominio: [https://sigua-online.com](https://sigua-online.com). El dominio anterior `mercado.humanosisu.net` redirige con 301 cuando `NEXT_PUBLIC_SITE_URL=https://sigua-online.com`.

## Contrato

| Ruta | Qué hace |
| --- | --- |
| `/` | Directorio de negocios |
| `/inscripcion` | Inscripción → `mercado_vendor_applications` |
| `/negocios/[slug]` | Ficha de negocio |
| `/mercado-san-pablo` | Página del Mercado Municipal San Pablo (visita física) |
| `/app/login` | Login unificado (super_admin + vendor) |
| `/app/forgot-password` | Recuperación de contraseña |
| `/auth/update-password` | Set/reset password (invite / recovery) |
| `/app` | Home stub del locatario |
| `/app/mercado` | Home operador (stats) |
| `/app/mercado/fichas` | Admin de fichas (`/nueva`, `/[id]`) |
| `/app/mercado/solicitudes` | Bandeja de inscripciones |
| `/app/mercado/configuracion` | Cierre forzado, horario, WhatsApp soporte |
| `/app/mercado/login` | 301 → `/app/login?redirect=/app/mercado` |
| `POST /api/auth/login` | Auth unificado (rate limit, role gate, claim vendor) |
| `POST /api/mercado/inscriptions` | Alta pública de solicitud |
| `/api/admin/mercado/*` | APIs de operador (JWT `super_admin`, service role) |

301 (en `middleware.ts` vía `lib/hosts.ts`, un solo salto):

| Antes | Ahora |
| --- | --- |
| `/mercadosanpablosigua`, `/mercado` | `/` |
| `/mercadosanpablosigua/inscripcion`, `/mercado/inscripcion` | `/inscripcion` |
| `/mercadosanpablosigua/[slug]`, `/mercado/[slug]` | `/negocios/[slug]` |
| `/mercadosanpablosiguav2` | `/mercado-san-pablo` |
| `mercado.humanosisu.net/*`, `www.sigua-online.com/*` | `https://sigua-online.com/*` (salvo `/api/*`) |

Los archivos de `/mercado/*.png` no se redirigen. Hosts extra para la 301: `MERCADO_LEGACY_HOSTS`.

## Login unificado

Un form, un endpoint. Separación: `site_user_profiles.role` + `mercado_vendors.auth_user_id`.

| Rol | Destino | Notas |
| --- | --- | --- |
| `super_admin` | `/app/mercado` | Operador municipal. Reemplaza cookie HMAC `mercado_op`. |
| `vendor` | `/app` | Locatario. Claim por `contact_email` si `auth_user_id` es null. |

Sesión: cookies Supabase httpOnly + `user_sessions` (TTL 12 h, idle 90 min). Browser: `autoRefreshToken: false`, `localStorage.user`. Heartbeat en `/api/auth/heartbeat`.

Seed del primer operador:

```bash
SEED_SUPER_ADMIN_EMAIL=... SEED_SUPER_ADMIN_PASSWORD=... \
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
npx tsx scripts/seed-super-admin.ts
```

Tras verificar login, no dejar `MERCADO_ADMIN_*` ni el seed en el servicio.

Invite locatario: en editar ficha, setear correo de login → «Invitar locatario».

## Aislamiento

Este repo no incluye Webycitas, Planilla, `company_id` ni roles HR.

| Pieza | Aquí |
| --- | --- |
| UI pública, CSS, `lib/mercado/*`, `public/mercado/` | Directorio Pickup |
| Auth | `lib/auth/*`, `lib/supabase/{server,browser,admin}.ts` |
| Admin | `/app/mercado/*` + JWT `super_admin` |
| Locatario | `/app` stub + claim de `mercado_vendors` |
| Tablas | `mercado_vendors`, `mercado_vendor_applications`, `site_user_profiles`, `user_sessions`, `mercado_site_settings`, `mercado_wa_clicks` |
| Storage | bucket `mercado-san-pablo` |
| Resend | `RESEND_FROM` = marca Mercado Digital de Siguatepeque |

RLS: `anon` lee fichas `status='active'` (GRANT por columna). Locatario autenticado lee/actualiza su ficha vía `current_vendor_id()`. `mercado_vendor_applications` sin policy pública: insert solo service role.

## Arranque

1. Copiar `.env.example` → `.env.local`.
2. Aplicar migraciones Supabase del directorio `supabase/migrations`.
3. `npm install && npm test && npm run dev`.
4. Seed super_admin (arriba).
5. Local: `http://localhost:3000` abre el directorio; login en `/app/login`. Sin fichas activas, la home muestra el estado vacío (no hay datos de ejemplo).

## Variables

Las de `.env.example`. No hardcodear secretos.
