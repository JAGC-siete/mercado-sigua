import Link from 'next/link'
import { MercadoInscriptionHeaderLink } from './InscriptionCta'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL,
} from '../../lib/mercado/categories'
import { MERCADO_GEO, MERCADO_SEO } from '../../lib/mercado/home'
import { MERCADO_HOURS_ROWS } from '../../lib/mercado/market-hours'
import {
  mercadoCategoryPath,
  mercadoHomePath,
  mercadoInscriptionPath,
} from '../../lib/mercado/paths'
import {
  MERCADO_DIRECTORY_WHATSAPP,
  vendorWhatsAppDigits,
} from '../../lib/mercado/whatsapp'
import { PRIVACY_PUBLIC_PATH, TERMS_PUBLIC_PATH } from '../../lib/marketing/legal-paths'
import styles from './mercado.module.css'

const ADMIN_HELP_HREF = `https://wa.me/${vendorWhatsAppDigits(MERCADO_DIRECTORY_WHATSAPP)}?text=${encodeURIComponent(
  'Hola, soy locatario del Mercado San Pablo y necesito ayuda con el directorio Pickup.'
)}`

export default function MercadoFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <section>
          <h2 className={styles.footerHeading}>Horario del mercado</h2>
          <table className={styles.hoursTable}>
            <caption className="sr-only">Horario oficial del Mercado Municipal San Pablo</caption>
            <tbody>
              {MERCADO_HOURS_ROWS.map((row) => (
                <tr key={row.days}>
                  <th scope="row">{row.days}</th>
                  <td>{row.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.footerMuted}>
            {MERCADO_SEO.addressLine}.{' '}
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
          <h2 className={styles.footerHeading}>Locatarios</h2>
          <ul className={styles.footerList}>
            <li>
              <Link href={mercadoInscriptionPath()}>Inscribir mi puesto</Link>
            </li>
            <li>
              <a href={ADMIN_HELP_HREF} target="_blank" rel="noopener noreferrer">
                Ayuda por WhatsApp (administración)
              </a>
            </li>
            <li>
              <Link href={`${mercadoHomePath()}#como-funciona-locatarios`}>
                Cómo aparece tu ficha
              </Link>
            </li>
          </ul>
          <p className={styles.footerMuted}>
            El registro básico es gratis. El VIP es aportación anual que se coordina aparte.
            Revisamos a mano y publicamos el puesto cuando esté listo.
          </p>
          <div className="mt-3">
            <MercadoInscriptionHeaderLink />
          </div>
        </section>
      </div>

      <div className={styles.footerTrust}>
        <p>
          Este sitio es un directorio Pickup: facilita el contacto por WhatsApp entre compradores y
          locatarios. Las reservas, pagos y entregas se acuerdan directamente con cada puesto; no
          somos intermediarios de la transacción.
        </p>
        <p className={styles.footerLegal}>
          <Link href={PRIVACY_PUBLIC_PATH}>Política de privacidad</Link>
          <span aria-hidden> · </span>
          <Link href={TERMS_PUBLIC_PATH}>Términos de servicio</Link>
        </p>
        <p className={styles.footerMuted}>
          {MERCADO_SEO.name}, {MERCADO_SEO.city}, {MERCADO_SEO.region}, Honduras.
        </p>
      </div>
    </footer>
  )
}
