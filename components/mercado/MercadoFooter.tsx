import Link from 'next/link'
import { MercadoInscriptionHeaderLink } from './InscriptionCta'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL,
} from '../../lib/mercado/categories'
import { MERCADO_GEO, MERCADO_SEO, SAN_PABLO_MARKET } from '../../lib/mercado/home'
import { MERCADO_HOURS_ROWS } from '../../lib/mercado/market-hours'
import {
  mercadoCategoryPath,
  mercadoHomePath,
  mercadoInscriptionPath,
  mercadoV2HomePath,
} from '../../lib/mercado/paths'
import {
  MERCADO_DIRECTORY_WHATSAPP,
  vendorWhatsAppDigits,
} from '../../lib/mercado/whatsapp'
import { PRIVACY_PUBLIC_PATH, TERMS_PUBLIC_PATH } from '../../lib/marketing/legal-paths'
import styles from './mercado.module.css'

export default function MercadoFooter({
  hoursRows = MERCADO_HOURS_ROWS,
  supportWhatsapp = MERCADO_DIRECTORY_WHATSAPP,
}: {
  hoursRows?: Array<{ days: string; hours: string }>
  supportWhatsapp?: string
}) {
  const adminHelpHref = `https://wa.me/${vendorWhatsAppDigits(supportWhatsapp)}?text=${encodeURIComponent(
    `Hola, tengo un negocio en ${MERCADO_SEO.name} y necesito ayuda con mi ficha.`
  )}`

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <section>
          <h2 className={styles.footerHeading}>
            <Link href={mercadoV2HomePath()}>Horario del {SAN_PABLO_MARKET.shortName}</Link>
          </h2>
          <table className={styles.hoursTable}>
            <caption className="sr-only">Horario del {SAN_PABLO_MARKET.name}</caption>
            <tbody>
              {hoursRows.map((row) => (
                <tr key={row.days}>
                  <th scope="row">{row.days}</th>
                  <td>{row.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.footerMuted}>
            {SAN_PABLO_MARKET.addressLine}.{' '}
            <a href={MERCADO_GEO.mapsUrl} target="_blank" rel="noopener noreferrer">
              Ver en Maps
            </a>
          </p>
        </section>

        <section>
          <h2 className={styles.footerHeading}>Categorías</h2>
          <ul className={styles.footerCats}>
            {VENDOR_CATEGORIES.map((key) => (
              <li key={key}>
                <Link href={mercadoCategoryPath(key)}>{VENDOR_CATEGORY_LABEL[key]}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={styles.footerHeading}>Negocios</h2>
          <ul className={styles.footerList}>
            <li>
              <Link href={mercadoInscriptionPath()}>Inscribir mi negocio</Link>
            </li>
            <li>
              <a href={adminHelpHref} target="_blank" rel="noopener noreferrer">
                Ayuda por WhatsApp (administración)
              </a>
            </li>
            <li>
              <Link href={`${mercadoHomePath()}#como-funciona-negocios`}>
                Cómo aparece tu negocio
              </Link>
            </li>
          </ul>
          <p className={styles.footerMuted}>
            El registro básico es gratis. La inscripción destacada cuesta L. 1,500 al año.
            Revisamos cada solicitud a mano y publicamos tu ficha cuando esté lista.
          </p>
          <div className="mt-3">
            <MercadoInscriptionHeaderLink />
          </div>
        </section>
      </div>

      <div className={styles.footerTrust}>
        <p>
          {MERCADO_SEO.name} es un directorio: te pone en contacto por WhatsApp con negocios de
          Siguatepeque. Los pedidos, pagos y entregas se acuerdan directamente con cada negocio; no
          somos intermediarios de la compra.
        </p>
        <p className={styles.footerLegal}>
          <Link href={PRIVACY_PUBLIC_PATH}>Política de privacidad</Link>
          <span aria-hidden> · </span>
          <Link href={TERMS_PUBLIC_PATH}>Términos de servicio</Link>
        </p>
        <p className={styles.footerMuted}>
          {MERCADO_SEO.name} · {MERCADO_SEO.domain} · {MERCADO_SEO.city}, {MERCADO_SEO.region}, Honduras.
        </p>
      </div>
    </footer>
  )
}
