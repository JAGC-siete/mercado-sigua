/** Host del directorio. En este repo / siempre abre San Pablo. */

const MERCADO_DEFAULT_HOSTS = ['mercado.humanosisu.net']

function hostSet(envName: string, defaults: readonly string[]): Set<string> {
  const extra = (process.env[envName] || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  return new Set([...defaults, ...extra])
}

export function hostnameOf(hostHeader: string): string {
  return hostHeader.split(':')[0].trim().toLowerCase()
}

export function mercadoHostnames(): Set<string> {
  return hostSet('MERCADO_HOSTS', MERCADO_DEFAULT_HOSTS)
}

/** / abre el directorio. El resto de rutas se queda igual. */
export function rewritePathForHost(_hostHeader: string, pathname: string): string | null {
  if (pathname === '/') return '/mercadosanpablosigua'
  return null
}
