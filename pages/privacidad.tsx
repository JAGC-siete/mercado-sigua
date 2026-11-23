import Head from 'next/head'
import Link from 'next/link'
import { MERCADO_SEO } from '../lib/mercado/home'
import { mercadoHomePath } from '../lib/mercado/paths'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-200">
      <Head>
        <title>{`Privacidad | ${MERCADO_SEO.name}`}</title>
        <meta name="robots" content="index, follow" />
      </Head>
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Política de privacidad</h1>
        <p>
          {MERCADO_SEO.name} ({MERCADO_SEO.domain}) es un directorio que te pone en contacto por
          WhatsApp con negocios de Siguatepeque. Para publicar una ficha recibimos el nombre del
          negocio, su ubicación, el WhatsApp y el plan elegido. No vendemos esa información.
        </p>
        <p>
          Los pedidos, pagos y entregas se acuerdan directamente con cada negocio. No somos
          intermediarios de la compra.
        </p>
        <p>
          <Link href={mercadoHomePath()} className="text-brand-300 underline-offset-2 hover:underline">
            Volver al directorio
          </Link>
        </p>
      </article>
    </div>
  )
}
