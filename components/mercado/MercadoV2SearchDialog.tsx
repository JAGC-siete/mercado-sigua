import { mercadoV2HomePath } from '../../lib/mercado/paths'
import {
  MERCADO_V2_COPY,
  MERCADO_V2_SEARCH_HINTS,
  mercadoV2SearchHints,
} from '../../lib/mercado/v2'
import { v2 } from './mv2'

function hintQuery(needles: readonly string[]) {
  return needles.find((token) => token.length >= 4) ?? needles[0]
}

export default function MercadoV2SearchDialog({ initialQuery }: { initialQuery: string }) {
  const matching = mercadoV2SearchHints(initialQuery)
  const hints = matching.length > 0 ? matching : MERCADO_V2_SEARCH_HINTS

  return (
    <div id="buscar" className={v2.searchOverlay} hidden>
      <div className={v2.dialog} role="dialog" aria-modal="true" aria-labelledby="mercado-v2-search-title">
        <div className={v2.dialogInner}>
          <div className={v2.dialogHead}>
            <h2 id="mercado-v2-search-title">{MERCADO_V2_COPY.searchTitle}</h2>
            <a href="#top" className={v2.dialogClose}>
              Cerrar
            </a>
          </div>

          <form action={`${mercadoV2HomePath()}#encontraras`} method="get" className={v2.searchBar} role="search">
            <label htmlFor="mercado-v2-search" className={v2.visuallyHidden}>
              Buscar un área o pasillo del mercado
            </label>
            <input
              id="mercado-v2-search"
              name="q"
              defaultValue={initialQuery || undefined}
              placeholder={MERCADO_V2_COPY.searchPlaceholder}
              autoComplete="off"
            />
            <button type="submit">Buscar área</button>
          </form>

          <div className={v2.hints}>
            {hints.map((hint) => (
              <a
                key={hint.label}
                href={`${mercadoV2HomePath()}?q=${encodeURIComponent(hintQuery(hint.needles))}#encontraras`}
                className={v2.hint}
              >
                {hint.label}
              </a>
            ))}
            <p className={v2.footerMuted}>{MERCADO_V2_COPY.searchHint}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
