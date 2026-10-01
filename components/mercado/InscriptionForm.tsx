/**
 * Formulario público: Solicitud de registro de local en página web.
 * Validación Zod compartida con el endpoint. Sin cuenta, sin cobro en línea, sin publicación automática.
 */

import { useId, useState, type FormEvent } from 'react'
import { MERCADO_INSCRIPTION_API_PATH } from '../../lib/mercado/paths'
import {
  MERCADO_INSCRIPTION_AUTHORIZATION_TEXT,
  MERCADO_PRESENCE_PLAN_COPY,
  MERCADO_PRESENCE_PLANS,
  mercadoInscriptionFieldErrors,
  parseMercadoInscription,
  type MercadoPresencePlan,
} from '../../lib/mercado/inscription-schema'
import styles from './mercado.module.css'

const fieldClass =
  'mt-1 w-full rounded-lg border px-3 py-3 text-stone-900 shadow-none outline-none ring-0 placeholder:text-stone-500 focus:border-amber-700 focus:ring-2 focus:ring-amber-200'
const fieldStyle = {
  borderColor: 'var(--mercado-line)',
  background: '#fff',
}

export default function InscriptionForm() {
  const formId = useId()
  const [businessName, setBusinessName] = useState('')
  const [stallNumber, setStallNumber] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [presencePlan, setPresencePlan] = useState<MercadoPresencePlan | ''>('')
  const [authorized, setAuthorized] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sentPlan, setSentPlan] = useState<MercadoPresencePlan | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const payload = {
      stallNumber,
      merchantName,
      businessName,
      whatsapp,
      presencePlan,
      authorized,
      website: honeypot,
    }

    const parsed = parseMercadoInscription(payload)
    if (!parsed.success) {
      setErrors(mercadoInscriptionFieldErrors(parsed.error))
      return
    }

    setErrors({})
    setSending(true)
    try {
      const res = await fetch(MERCADO_INSCRIPTION_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          fields?: Record<string, string>
        }
        setErrors(body.fields ?? { submit: body.error || 'No se pudo enviar. Intenta de nuevo.' })
        return
      }
      setSentPlan(parsed.data.presencePlan)
    } catch {
      setErrors({ submit: 'Sin conexión. Revisa tu internet e intenta de nuevo.' })
    } finally {
      setSending(false)
    }
  }

  if (sentPlan) {
    return (
      <div className={styles.inscriptionSuccess} role="status">
        <h2>Solicitud recibida</h2>
        <p>
          Recibimos tu solicitud de registro. Queda pendiente de revisión: la publicación no es
          inmediata y el directorio no cambia hasta el alta a mano.
        </p>
        {sentPlan === 'featured_vip' ? (
          <p>
            Elegiste el perfil destacado. La aportación anual (L. 1,500) y el sticker se
            coordinan aparte. Este envío no registra un pago.
          </p>
        ) : (
          <p>Elegiste el registro básico, sin aportación.</p>
        )}
      </div>
    )
  }

  const stallErrorId = `${formId}-stall-error`
  const merchantErrorId = `${formId}-merchant-error`
  const businessErrorId = `${formId}-business-error`
  const whatsappErrorId = `${formId}-whatsapp-error`
  const planErrorId = `${formId}-plan-error`
  const authorizedErrorId = `${formId}-authorized-error`

  return (
    <form onSubmit={onSubmit} noValidate className={styles.inscriptionForm}>
      <section className={styles.inscriptionSection} aria-labelledby={`${formId}-datos`}>
        <h2 id={`${formId}-datos`}>1. Datos del comercio</h2>

        <div>
          <label htmlFor={`${formId}-business`} className={styles.inscriptionLabel}>
            Nombre del local
          </label>
          <input
            id={`${formId}-business`}
            name="businessName"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Cómo querés que aparezca el puesto"
            autoComplete="organization"
            className={fieldClass}
            style={fieldStyle}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? businessErrorId : undefined}
            required
          />
          {errors.businessName && (
            <p id={businessErrorId} className={styles.inscriptionError}>
              {errors.businessName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-stall`} className={styles.inscriptionLabel}>
            Número de puesto / pasillo
          </label>
          <input
            id={`${formId}-stall`}
            name="stallNumber"
            value={stallNumber}
            onChange={(event) => setStallNumber(event.target.value)}
            placeholder="Pasillo 1, local 8"
            autoComplete="off"
            className={fieldClass}
            style={fieldStyle}
            aria-invalid={Boolean(errors.stallNumber)}
            aria-describedby={errors.stallNumber ? stallErrorId : undefined}
            required
          />
          {errors.stallNumber && (
            <p id={stallErrorId} className={styles.inscriptionError}>
              {errors.stallNumber}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-merchant`} className={styles.inscriptionLabel}>
            Nombre del propietario
          </label>
          <input
            id={`${formId}-merchant`}
            name="merchantName"
            value={merchantName}
            onChange={(event) => setMerchantName(event.target.value)}
            placeholder="Quién es dueño del puesto"
            autoComplete="name"
            className={fieldClass}
            style={fieldStyle}
            aria-invalid={Boolean(errors.merchantName)}
            aria-describedby={errors.merchantName ? merchantErrorId : undefined}
            required
          />
          {errors.merchantName && (
            <p id={merchantErrorId} className={styles.inscriptionError}>
              {errors.merchantName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-whatsapp`} className={styles.inscriptionLabel}>
            Teléfono / WhatsApp
          </label>
          <input
            id={`${formId}-whatsapp`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="Ej. 9999-0000"
            autoComplete="tel"
            className={fieldClass}
            style={fieldStyle}
            aria-invalid={Boolean(errors.whatsapp)}
            aria-describedby={errors.whatsapp ? whatsappErrorId : undefined}
            required
          />
          {errors.whatsapp && (
            <p id={whatsappErrorId} className={styles.inscriptionError}>
              {errors.whatsapp}
            </p>
          )}
        </div>
      </section>

      <fieldset className={styles.inscriptionSection} aria-describedby={errors.presencePlan ? planErrorId : undefined}>
        <legend id={`${formId}-plan`}>2. Nivel de presencia</legend>
        <p className={styles.inscriptionHint}>Elegí exactamente una opción. El VIP no se cobra en este envío.</p>
        <div className={styles.planGrid} role="radiogroup" aria-labelledby={`${formId}-plan`} aria-required="true">
          {MERCADO_PRESENCE_PLANS.map((plan) => {
            const copy = MERCADO_PRESENCE_PLAN_COPY[plan]
            const selected = presencePlan === plan
            const inputId = `${formId}-plan-${plan}`
            return (
              <label
                key={plan}
                htmlFor={inputId}
                className={`${styles.planCard} ${selected ? styles.planCardSelected : ''}`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="presencePlan"
                  value={plan}
                  checked={selected}
                  onChange={() => setPresencePlan(plan)}
                  required
                />
                <span className={styles.planCardBody}>
                  <span className={styles.planCardTitle}>{copy.title}</span>
                  <span className={styles.planCardPrice}>{copy.price}</span>
                </span>
              </label>
            )
          })}
        </div>
        {errors.presencePlan && (
          <p id={planErrorId} className={styles.inscriptionError}>
            {errors.presencePlan}
          </p>
        )}
      </fieldset>

      <section className={styles.inscriptionSection} aria-labelledby={`${formId}-auth`}>
        <h2 id={`${formId}-auth`}>3. Autorización</h2>
        <label className={styles.inscriptionCheck} htmlFor={`${formId}-authorized`}>
          <input
            id={`${formId}-authorized`}
            name="authorized"
            type="checkbox"
            checked={authorized}
            onChange={(event) => setAuthorized(event.target.checked)}
            required
            aria-invalid={Boolean(errors.authorized)}
            aria-describedby={errors.authorized ? authorizedErrorId : undefined}
          />
          <span>{MERCADO_INSCRIPTION_AUTHORIZATION_TEXT}</span>
        </label>
        {errors.authorized && (
          <p id={authorizedErrorId} className={styles.inscriptionError}>
            {errors.authorized}
          </p>
        )}
      </section>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="inscription-website">Sitio web</label>
        <input
          id="inscription-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {errors.submit && <p className={styles.inscriptionError}>{errors.submit}</p>}

      <button type="submit" disabled={sending} className={styles.inscriptionSubmit}>
        {sending ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
