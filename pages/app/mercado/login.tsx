import type { GetServerSideProps } from 'next'
import { appLoginPath } from '../../../lib/mercado/paths'

/** Corte HMAC: login canónico en /app/login. */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: appLoginPath('/app/mercado'),
    permanent: true,
  },
})

export default function MercadoAdminLoginRedirect() {
  return null
}
