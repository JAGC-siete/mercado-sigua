import Head from 'next/head'
import Link from 'next/link'
import { mercadoHomePath } from '../lib/mercado/paths'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-200">
      <Head>
        <title>Privacidad | Mercado Municipal San Pablo</title>
        <meta name="robots" content="index, follow" />
      </Head>
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Política de privacidad</h1>
        <p>
          Este sitio es un directorio Pickup: facilita el contacto por WhatsApp entre compradores y
          locatarios. Recibimos el local, WhatsApp y el plan de presencia para publicar la ficha.
          No vendemos esa información.
        </p>
        <p>
          Las reservas, pagos y entregas se acuerdan directamente con cada puesto. No somos
          intermediarios de la transacción.
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
