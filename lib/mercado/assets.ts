/**
 * Fotos del directorio viven en public/mercado.
 * El 301/308 de /mercado/:slug no debe aplicarse a archivos; igual se agrega
 * cache-bust porque un 308 previo queda pegado en el navegador.
 */
export const MERCADO_STATIC_CACHE = '2'

export function mercadoStaticSrc(path: string): string {
  if (!path.startsWith('/mercado/') || path.includes('?')) return path
  return `${path}?v=${MERCADO_STATIC_CACHE}`
}
