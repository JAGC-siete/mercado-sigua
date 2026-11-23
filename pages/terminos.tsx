import Head from 'next/head'
import Link from 'next/link'
import { MERCADO_SEO } from '../lib/mercado/home'
import { mercadoHomePath } from '../lib/mercado/paths'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-200">
      <Head>
        <title>{`Términos | ${MERCADO_SEO.name}`}</title>
        <meta name="robots" content="index, follow" />
      </Head>
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Términos de servicio</h1>
        <p>
          El registro básico de un negocio en {MERCADO_SEO.name} es gratis. La inscripción
          destacada cuesta L. 1,500 al año y el pago se coordina aparte. Revisamos cada solicitud
          a mano y publicamos la ficha cuando esté lista.
        </p>
        <p>
          Este directorio no intermedia pagos ni entregas entre compradores y negocios. El trato
          queda entre el comprador y el negocio.
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
