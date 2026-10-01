import MercadoV2SearchDialog from './MercadoV2SearchDialog'
import { mercadoV2HomePath } from '../../lib/mercado/paths'
import { MERCADO_V2_COPY, MERCADO_V2_SEO } from '../../lib/mercado/v2'
import { v2 } from './mv2'

function homeAnchor(hash: string) {
  return `${mercadoV2HomePath()}#${hash}`
}

const NAV = [
  { href: homeAnchor('beneficios'), label: 'Por qué venir' },
  { href: homeAnchor('encontraras'), label: 'Qué encontrarás' },
  { href: homeAnchor('horarios'), label: 'Horarios' },
  { href: homeAnchor('visita'), label: 'Cómo llegar' },
] as const

export default function MercadoV2Chrome({ searchQuery }: { searchQuery: string }) {
  return (
    <>
      <header className={v2.chrome}>
        <div className={v2.chromeRow}>
          <a href={mercadoV2HomePath()} className={v2.brand}>
            {MERCADO_V2_SEO.name}
          </a>
          <nav className={v2.nav} aria-label="Secciones de la visita">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className={v2.navLink}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={v2.utils}>
            <a href={homeAnchor('horarios')} className={v2.util}>
              {MERCADO_V2_COPY.hoursCompact}
            </a>
            <a href={homeAnchor('visita')} className={v2.util}>
              {MERCADO_V2_COPY.mapsCta}
            </a>
            <a
              href="#buscar"
              className={v2.iconBtn}
              aria-label="Buscar un área o pasillo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <MercadoV2SearchDialog initialQuery={searchQuery} />
    </>
  )
}
