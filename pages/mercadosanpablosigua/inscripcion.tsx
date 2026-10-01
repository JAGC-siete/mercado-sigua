/**
 * Solicitud pública de registro de local. Sin cuenta, sin cobro en línea, sin publicación automática.
 * Shell: isPublicTenantLandingRoute (/mercadosanpablosigua/inscripcion).
 */

import Head from 'next/head'
import Link from 'next/link'
import InscriptionForm from '../../components/mercado/InscriptionForm'
import MercadoPublicShell from '../../components/mercado/MercadoPublicShell'
import styles from '../../components/mercado/mercado.module.css'
import { MERCADO_SEO } from '../../lib/mercado/home'
import {
  mercadoInscriptionCanonical,
  mercadoInscriptionDescription,
  mercadoInscriptionTitle,
} from '../../lib/mercado/meta'
import { mercadoHomePath } from '../../lib/mercado/paths'

export default function MercadoInscriptionPage() {
  const title = mercadoInscriptionTitle()
  const description = mercadoInscriptionDescription()
  const canonical = mercadoInscriptionCanonical()

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_HN" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
      <MercadoPublicShell>
        <article className="mx-auto max-w-2xl px-4 py-12">
          <Link href={mercadoHomePath()} className="text-sm text-amber-900 underline">
            Volver al directorio
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Solicitud de registro de local en página web
          </h1>
          <p className={`mt-4 ${styles.inscriptionLead}`}>
            Completá estos datos para pedir que tu comercio aparezca en el directorio de{' '}
            {MERCADO_SEO.name}. El registro básico es gratuito. El perfil destacado con una
            aportación anual (L. 1,500).
          </p>
          <div className="mt-8">
            <InscriptionForm />
          </div>
        </article>
      </MercadoPublicShell>
    </>
  )
}
