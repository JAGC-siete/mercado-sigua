# Mercado Municipal San Pablo

Directorio Pickup del Mercado Municipal San Pablo, Siguatepeque. Repo propio. El público pide por WhatsApp y recoge en el local. El operador municipal publica fichas a mano.

Línea de producción: [https://mercado.humanosisu.net/mercadosanpablosigua](https://mercado.humanosisu.net/mercadosanpablosigua)

## Contrato

| Ruta | Qué hace |
| --- | --- |
| `/` | Rewrite al directorio |
| `/mercadosanpablosigua` | Directorio v1 (puestos / locatarios) |
| `/mercadosanpablosigua/inscripcion` | Inscripción Pickup → `mercado_vendor_applications` |
| `/mercadosanpablosigua/[slug]` | Ficha de puesto |
| `/mercadosanpablosiguav2` | Landing institucional (visita física) |
| `/app/mercado/login` | Login del operador municipal |
| `/app/mercado/fichas` | Admin de fichas (`/nueva`, `/[id]`) |
| `/app/mercado/solicitudes` | Bandeja de inscripciones |
| `POST /api/mercado/inscriptions` | Alta pública de solicitud |
| `/api/admin/mercado/*` | APIs de operador (cookie HMAC, service role) |

301: `/mercado` (sin extensión) → `/mercadosanpablosigua`. Los PNG de `/mercado/*.png` no se reescriben.

## Aislamiento

Este repo no incluye Webycitas, Planilla, `company_id` ni SuperAdmin de RRHH.

| Pieza | Aquí |
| --- | --- |
| UI pública, CSS, `lib/mercado/*`, `public/mercado/` | Copia de la línea que hoy sirve el sitio |
| APIs de inscripción y CRUD | `lib/supabase/{admin,public}.ts` |
| Admin | `/app/mercado/*` + cookie HMAC `mercado_op` |
| Tablas | `mercado_vendors`, `mercado_vendor_applications` |
| Storage | bucket `mercado-san-pablo` |
| Resend | `RESEND_FROM` = marca Mercado San Pablo |

RLS: `anon` lee fichas `status='active'` (GRANT por columna). `mercado_vendor_applications` no tiene policy ni GRANT: insert solo service role.

## Arranque

1. Copiar `.env.example` → `.env.local`.
2. `npm install && npm test && npm run dev`.
3. Local: `http://localhost:3000` reescribe a `/mercadosanpablosigua`.

## Variables

Las de `.env.example`. No hardcodear secretos.
