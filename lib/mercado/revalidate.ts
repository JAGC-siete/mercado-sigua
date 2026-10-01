import type { NextApiResponse } from 'next'
import { mercadoHomePath, mercadoVendorPath } from './paths'

/** Purga ISR del directorio tras mutaciones SuperAdmin. */
export async function revalidateMercadoPages(
  res: NextApiResponse,
  slug?: string | null
): Promise<void> {
  const paths = [mercadoHomePath()]
  if (slug) paths.push(mercadoVendorPath(slug))

  for (const path of paths) {
    try {
      await res.revalidate(path)
    } catch (err) {
      console.error(`[mercado/revalidate] failed for ${path}:`, err)
    }
  }
}
