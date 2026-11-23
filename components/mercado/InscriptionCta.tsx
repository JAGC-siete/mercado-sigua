import Link from 'next/link'
import { mercadoInscriptionPath } from '../../lib/mercado/paths'
import styles from './mercado.module.css'

const CTA_TITLE = '¿Tienes un negocio en Siguatepeque?'
const CTA_BODY =
  'Inscríbelo en el directorio. El registro básico es gratis; la inscripción destacada cuesta L. 1,500 al año. Revisamos tu solicitud y publicamos la ficha a mano.'
const CTA_ACTION = 'Solicitar registro'

export function MercadoInscriptionHeaderLink() {
  return (
    <Link
      href={mercadoInscriptionPath()}
      className="shrink-0 text-sm font-bold underline-offset-4 hover:underline"
      style={{ color: 'var(--mercado-chile)' }}
    >
      Inscribir mi negocio
    </Link>
  )
}

export function MercadoInscriptionBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div
        className={`${styles.panelLocal} flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`}
      >
        <div className="max-w-2xl">
          <h2 className={styles.sectionTitle}>{CTA_TITLE}</h2>
          <p className="mt-3" style={{ color: 'var(--mercado-muted)' }}>
            {CTA_BODY}
          </p>
        </div>
        <Link href={mercadoInscriptionPath()} className={styles.ctaSolid}>
          {CTA_ACTION}
        </Link>
      </div>
    </section>
  )
}

export function MercadoInscriptionCompactCta() {
  return (
    <aside
      className="mt-12 rounded-xl border p-6"
      style={{
        borderColor: 'var(--mercado-line)',
        background: 'color-mix(in srgb, var(--mercado-cream) 70%, #efe6d8)',
      }}
    >
      <h2 className="text-lg font-bold" style={{ color: 'var(--mercado-cacao)' }}>
        ¿Tu negocio no está en el directorio?
      </h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--mercado-muted)' }}>
        Envía una solicitud. El registro básico es gratis; la inscripción destacada cuesta L. 1,500
        al año. No necesitas crear una cuenta y la publicación no es inmediata.
      </p>
      <Link href={mercadoInscriptionPath()} className={`${styles.ctaSolid} mt-4`}>
        {CTA_ACTION}
      </Link>
    </aside>
  )
}
