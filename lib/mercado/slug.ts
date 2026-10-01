/** Slugs que chocan con rutas del sitio o del propio directorio. */
export const RESERVED_VENDOR_SLUGS: readonly string[] = [
  'admin',
  'api',
  'app',
  'auth',
  'categoria',
  'categorias',
  'index',
  'inscribir',
  'inscripcion',
  'login',
  'mercado',
  'mercadosanpablosigua',
  'mercadosanpablosiguav2',
  'new',
  'nuevo',
  'sitemap',
  'solicitud',
  'vendors',
]

/** Normaliza un nombre de puesto a slug SEO ("Comedor El Patio" -> "comedor-el-patio"). */
export function slugifyVendorName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '')
}

export function isReservedVendorSlug(slug: string): boolean {
  return (RESERVED_VENDOR_SLUGS as readonly string[]).includes(slug)
}
