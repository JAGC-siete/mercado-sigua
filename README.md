# Mercado Municipal San Pablo

Directorio Pickup del Mercado Municipal San Pablo, Siguatepeque. Repo propio. El público pide por WhatsApp y recoge en el local. El operador municipal publica fichas; el locatario entra con el login unificado.

Línea de producción: [https://mercado.humanosisu.net/mercadosanpablosigua](https://mercado.humanosisu.net/mercadosanpablosigua)

## Contrato

| Ruta | Qué hace |
| --- | --- |
| `/` | Rewrite al directorio |
| `/mercadosanpablosigua` | Directorio v1 (puestos / locatarios) |
| `/mercadosanpablosigua/inscripcion` | Inscripción Pickup → `mercado_vendor_applications` |
| `/mercadosanpablosigua/[slug]` | Ficha de puesto |
| `/mercadosanpablosiguav2` | Landing institucional (visita física) |
| `/app/login` | Login unificado (super_admin + vendor) |
| `/app/forgot-password` | Recuperación de contraseña |
| `/auth/update-password` | Set/reset password (invite / recovery) |
| `/app` | Home stub del locatario |
| `/app/mercado/fichas` | Admin de fichas (`/nueva`, `/[id]`) |
| `/app/mercado/solicitudes` | Bandeja de inscripciones |
| `/app/mercado/login` | 301 → `/app/login?redirect=/app/mercado` |
| `POST /api/auth/login` | Auth unificado (rate limit, role gate, claim vendor) |
| `POST /api/mercado/inscriptions` | Alta pública de solicitud |
| `/api/admin/mercado/*` | APIs de operador (JWT `super_admin`, service role) |

301: `/mercado` (sin extensión) → `/mercadosanpablosigua`. Los PNG de `/mercado/*.png` no se reescriben.

## Login unificado

Un form, un endpoint. Separación: `user_profiles.role` + `mercado_vendors.auth_user_id`.

| Rol | Destino | Notas |
| --- | --- | --- |
| `super_admin` | `/app/mercado/fichas` | Operador municipal. Reemplaza cookie HMAC `mercado_op`. |
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
| Tablas | `mercado_vendors`, `mercado_vendor_applications`, `user_profiles`, `user_sessions` |
| Storage | bucket `mercado-san-pablo` |
| Resend | `RESEND_FROM` = marca Mercado San Pablo |

RLS: `anon` lee fichas `status='active'` (GRANT por columna). Locatario autenticado lee/actualiza su ficha vía `current_vendor_id()`. `mercado_vendor_applications` sin policy pública: insert solo service role.

## Arranque

1. Copiar `.env.example` → `.env.local`.
2. Aplicar migraciones Supabase del directorio `supabase/migrations`.
3. `npm install && npm test && npm run dev`.
4. Seed super_admin (arriba).
5. Local: `http://localhost:3000` reescribe a `/mercadosanpablosigua`; login en `/app/login`.

## Variables

Las de `.env.example`. No hardcodear secretos.
