import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  looksLikeInscriptionBot,
  mercadoInscriptionFieldErrors,
  mercadoInscriptionToApplicationRow,
  mercadoPresencePlanNotifyLabel,
  parseMercadoInscription,
  MERCADO_INSCRIPTION_AUTHORIZATION_TEXT,
  MERCADO_PRESENCE_PLAN_COPY,
} from '../lib/mercado/inscription-schema'
import {
  buildMercadoInscriptionNotification,
  MERCADO_INSCRIPTION_NOTIFY_DEFAULT,
  mercadoInscriptionNotifyEmail,
} from '../lib/mercado/inscription-email'
import {
  MERCADO_APPLICATIONS_ADMIN_API_PATH,
  MERCADO_APPLICATIONS_ADMIN_PATH,
  MERCADO_INSCRIPTION_API_PATH,
  mercadoInscriptionPath,
} from '../lib/mercado/paths'
import { isReservedVendorSlug } from '../lib/mercado/slug'
import { parseCreateVendor } from '../lib/mercado/schema'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const valid = {
  stallNumber: 'Pasillo 1, local 8',
  merchantName: 'Carmen López',
  businessName: 'Comedor El Patio',
  whatsapp: '9999-0000',
  presencePlan: 'basic' as const,
  authorized: true as const,
}

describe('mercado: solicitud de registro de local', () => {
  it('acepta el camino feliz básico', () => {
    const parsed = parseMercadoInscription(valid)
    assert.equal(parsed.success, true)
    if (!parsed.success) return
    assert.equal(parsed.data.presencePlan, 'basic')
    assert.equal(parsed.data.authorized, true)
    assert.equal(parsed.data.whatsapp, '9999-0000')
  })

  it('acepta el camino feliz VIP', () => {
    const parsed = parseMercadoInscription({ ...valid, presencePlan: 'featured_vip' })
    assert.equal(parsed.success, true)
    if (!parsed.success) return
    assert.equal(parsed.data.presencePlan, 'featured_vip')
    const row = mercadoInscriptionToApplicationRow(parsed.data, new Date('2026-09-18T18:00:00.000Z'))
    assert.equal(row.presence_plan, 'featured_vip')
    assert.equal(row.whatsapp, '9999-0000')
    assert.equal(row.status, 'received')
    assert.equal(row.authorization_text, MERCADO_INSCRIPTION_AUTHORIZATION_TEXT)
    assert.equal('website' in row, false)
    assert.equal('authorized' in row, false)
  })

  it('rechaza sin WhatsApp', () => {
    const parsed = parseMercadoInscription({ ...valid, whatsapp: '' })
    assert.equal(parsed.success, false)
    if (!parsed.success) {
      assert.match(mercadoInscriptionFieldErrors(parsed.error).whatsapp ?? '', /WhatsApp/)
    }
  })

  it('rechaza WhatsApp sin dígitos suficientes', () => {
    const parsed = parseMercadoInscription({ ...valid, whatsapp: 'abc-defg' })
    assert.equal(parsed.success, false)
  })

  it('rechaza sin autorización', () => {
    const missing = parseMercadoInscription({
      stallNumber: valid.stallNumber,
      merchantName: valid.merchantName,
      businessName: valid.businessName,
      whatsapp: valid.whatsapp,
      presencePlan: valid.presencePlan,
    })
    assert.equal(missing.success, false)

    const denied = parseMercadoInscription({ ...valid, authorized: false })
    assert.equal(denied.success, false)
    if (!denied.success) {
      assert.match(mercadoInscriptionFieldErrors(denied.error).authorized ?? '', /Autorizá/)
    }
  })

  it('rechaza plan inválido', () => {
    const parsed = parseMercadoInscription({ ...valid, presencePlan: 'vip' })
    assert.equal(parsed.success, false)
    if (!parsed.success) {
      assert.match(mercadoInscriptionFieldErrors(parsed.error).presencePlan ?? '', /presencia/)
    }
  })

  it('descarta campos extra y no exige website', () => {
    const parsed = parseMercadoInscription({
      ...valid,
      featured: true,
      photoUrl: 'https://example.com/a.jpg',
      website: '',
    })
    assert.equal(parsed.success, true)
    if (!parsed.success) return
    assert.equal('featured' in parsed.data, false)
    assert.equal('photoUrl' in parsed.data, false)
  })

  it('rechaza número de puesto vacío', () => {
    const parsed = parseMercadoInscription({ ...valid, stallNumber: '  ' })
    assert.equal(parsed.success, false)
    if (!parsed.success) {
      assert.match(mercadoInscriptionFieldErrors(parsed.error).stallNumber ?? '', /puesto/)
    }
  })

  it('rechaza nombre de local corto', () => {
    const parsed = parseMercadoInscription({ ...valid, businessName: 'A' })
    assert.equal(parsed.success, false)
  })

  it('un honeypot lleno parece bot y uno vacío no', () => {
    const clean = parseMercadoInscription(valid)
    assert.equal(clean.success, true)
    if (clean.success) assert.equal(looksLikeInscriptionBot(clean.data), false)

    const bot = parseMercadoInscription({ ...valid, website: 'http://spam.example' })
    assert.equal(bot.success, true)
    if (bot.success) assert.equal(looksLikeInscriptionBot(bot.data), true)
  })

  it('el correo de aviso incluye WhatsApp, plan y autorización, sin hablar de pago', () => {
    const basic = parseMercadoInscription(valid)
    assert.equal(basic.success, true)
    if (!basic.success) return

    const mail = buildMercadoInscriptionNotification({
      inscription: basic.data,
      receivedAt: new Date('2026-09-17T20:00:00.000Z'),
    })

    assert.match(mail.subject, /Solicitud de registro de local/)
    assert.match(mail.subject, /Comedor El Patio/)
    assert.match(mail.subject, /Pasillo 1, local 8/)
    assert.ok(mail.html.includes('Carmen López'))
    assert.ok(mail.html.includes('9999-0000'))
    assert.ok(mail.html.includes('Básico'))
    assert.ok(mail.html.includes('autorizó publicar'))
    assert.ok(mail.html.includes('pendiente de revisión'))
    assert.ok(mail.html.includes('/app/mercado/solicitudes'))
    assert.equal(/crear perfil|contraseña|pagado|pago recibido/i.test(mail.html), false)

    const vipParsed = parseMercadoInscription({ ...valid, presencePlan: 'featured_vip' })
    assert.equal(vipParsed.success, true)
    if (!vipParsed.success) return
    const vipMail = buildMercadoInscriptionNotification({
      inscription: vipParsed.data,
      receivedAt: new Date('2026-09-17T20:00:00.000Z'),
    })
    assert.match(vipMail.html, /VIP L\. 1,500/)
    assert.match(vipMail.html, /aportación/)
    assert.equal(/pagado|cobro registrado|pago recibido/i.test(vipMail.html), false)
    assert.match(mercadoPresencePlanNotifyLabel('featured_vip'), /no registrada como pago/)
  })

  it('acota el texto de autorización y no arrastra el typo del papel', () => {
    assert.equal(MERCADO_PRESENCE_PLAN_COPY.basic.title, 'Registro básico')
    assert.equal(MERCADO_PRESENCE_PLAN_COPY.featured_vip.title, 'Perfil destacado')
    assert.equal(MERCADO_PRESENCE_PLAN_COPY.featured_vip.price, 'Aportación L. 1,500 / año')
    assert.ok(MERCADO_INSCRIPTION_AUTHORIZATION_TEXT.length >= 20)
    assert.ok(MERCADO_INSCRIPTION_AUTHORIZATION_TEXT.length <= 500)
    const schemaSource = readFileSync(join(process.cwd(), 'lib/mercado/inscription-schema.ts'), 'utf8')
    assert.equal(schemaSource.includes('promociones rtas'), false)
  })

  it('reserva inscripcion para el formulario y deja el API en rutas públicas', () => {
    assert.equal(mercadoInscriptionPath(), '/mercadosanpablosigua/inscripcion')
    assert.equal(isReservedVendorSlug('inscripcion'), true)
    assert.equal(isReservedVendorSlug('solicitud'), true)
    assert.equal(
      parseCreateVendor({
        name: 'Puesto',
        category: 'otros',
        description: 'Descripción de al menos diez caracteres.',
        whatsapp: '9999-0000',
        slug: 'inscripcion',
      }).success,
      false
    )
    assert.equal(MERCADO_INSCRIPTION_API_PATH, '/api/mercado/inscriptions')
    assert.equal(MERCADO_APPLICATIONS_ADMIN_PATH, '/app/mercado/solicitudes')
    assert.equal(MERCADO_APPLICATIONS_ADMIN_API_PATH, '/api/admin/mercado/applications')
  })

  it('el POST público no enrolla planilla ni crea vendor y persiste WhatsApp, plan y autorización', () => {
    const handler = readFileSync(join(process.cwd(), 'pages/api/mercado/inscriptions.ts'), 'utf8')
    assert.equal(handler.includes('marketing_leads'), false)
    assert.equal(handler.includes('enrollPublicToolLead'), false)
    assert.equal(handler.includes("from('vendors')"), false)
    assert.equal(handler.includes("from('leads')"), false)
    assert.match(handler, /VENDOR_APPLICATIONS_TABLE/)
    assert.match(handler, /mercadoInscriptionToApplicationRow/)
    assert.match(handler, /MAX_BODY_BYTES = 8 \* 1024/)
    assert.match(handler, /Solicitud recibida/)
    assert.equal(handler.includes('applicationId,'), true)
    assert.equal(/json\(\{[\s\S]*presencePlan/.test(handler), false)
  })

  it('la bandeja admin lista WhatsApp, plan y autorización; crear ficha sugiere VIP', () => {
    const applications = readFileSync(
      join(process.cwd(), 'pages/api/admin/mercado/applications.ts'),
      'utf8'
    )
    assert.match(applications, /whatsapp/)
    assert.match(applications, /presence_plan/)
    assert.match(applications, /authorized_at/)
    assert.match(applications, /Aprobá creando la ficha/)

    const inbox = readFileSync(join(process.cwd(), 'pages/app/mercado/solicitudes.tsx'), 'utf8')
    assert.match(inbox, /WhatsApp/)
    assert.match(inbox, /presence_plan/)

    const nueva = readFileSync(join(process.cwd(), 'pages/app/mercado/fichas/nueva.tsx'), 'utf8')
    assert.match(nueva, /whatsapp: app\.whatsapp/)
    assert.match(nueva, /featured: app\.presence_plan === 'featured_vip'/)
  })

  it('el formulario público usa el mismo Zod, honeypot y radio de plan', () => {
    const form = readFileSync(join(process.cwd(), 'components/mercado/InscriptionForm.tsx'), 'utf8')
    assert.match(form, /parseMercadoInscription/)
    assert.match(form, /name="presencePlan"/)
    assert.match(form, /type="radio"/)
    assert.match(form, /tabIndex=\{-1\}/)
    assert.match(form, /aria-hidden="true"/)
    assert.match(form, /name="website"/)
    assert.match(form, /MERCADO_INSCRIPTION_AUTHORIZATION_TEXT/)
    assert.match(form, /required/)
    assert.equal(form.includes('type="file"'), false)
  })

  it('avisa al buzón de operación por default', () => {
    assert.equal(MERCADO_INSCRIPTION_NOTIFY_DEFAULT, 'jorge7gomez@gmail.com')
    const previous = process.env.MERCADO_INSCRIPTION_NOTIFY_EMAIL
    const previousNotify = process.env.NOTIFY_EMAIL
    try {
      delete process.env.MERCADO_INSCRIPTION_NOTIFY_EMAIL
      delete process.env.NOTIFY_EMAIL
      assert.equal(mercadoInscriptionNotifyEmail(), 'jorge7gomez@gmail.com')
    } finally {
      if (previous === undefined) delete process.env.MERCADO_INSCRIPTION_NOTIFY_EMAIL
      else process.env.MERCADO_INSCRIPTION_NOTIFY_EMAIL = previous
      if (previousNotify === undefined) delete process.env.NOTIFY_EMAIL
      else process.env.NOTIFY_EMAIL = previousNotify
    }
  })
})
