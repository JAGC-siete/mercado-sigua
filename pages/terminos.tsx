import Head from 'next/head'
import Link from 'next/link'
import { mercadoHomePath } from '../lib/mercado/paths'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-200">
      <Head>
        <title>Términos | Mercado Municipal San Pablo</title>
        <meta name="robots" content="index, follow" />
      </Head>
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Términos de servicio</h1>
        <p>
          El registro básico del puesto es gratis. El VIP es aportación anual que se coordina
          aparte. Revisamos a mano y publicamos la ficha cuando esté lista.
        </p>
        <p>
          Este directorio no intermedia pagos ni entregas. El trato queda entre el comprador y el
          locatario.
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
