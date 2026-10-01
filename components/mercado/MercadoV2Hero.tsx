import { mercadoStaticSrc } from '../../lib/mercado/assets'
import { mercadoV2HomePath } from '../../lib/mercado/paths'
import { MERCADO_V2_COPY, MERCADO_V2_SEO } from '../../lib/mercado/v2'
import { v2 } from './mv2'

export default function MercadoV2Hero() {
  return (
    <section className={v2.hero}>
      <div className={v2.heroParallax}>
        <img
          className={v2.heroMedia}
          src={mercadoStaticSrc(MERCADO_V2_SEO.heroImage)}
          alt="Pasillo del Mercado Municipal San Pablo"
          width={1600}
          height={1000}
        />
      </div>
      <div className={v2.heroScrim} aria-hidden="true" />
      <div className={v2.heroInner}>
        <p className={v2.eyebrow}>Siguatepeque, Comayagua</p>
        <h1 className={v2.name}>{MERCADO_V2_COPY.h1}</h1>
        <p className={v2.display}>{MERCADO_V2_COPY.heroDisplay}</p>
        <p className={v2.lead}>{MERCADO_V2_SEO.heroLead}</p>
        <a href={`${mercadoV2HomePath()}#beneficios`} className={v2.heroCta}>
          {MERCADO_V2_COPY.enterCta}
        </a>
      </div>
    </section>
  )
}
