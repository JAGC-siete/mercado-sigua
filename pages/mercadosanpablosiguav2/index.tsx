/**
 * Landing institucional v2: visita física al Mercado San Pablo.
 * Sin directorio de puestos, sin WhatsApp de locatario, sin inscripción en el cuerpo.
 * Shell: isPublicTenantLandingRoute (/mercadosanpablosiguav2).
 */

import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import MercadoV2Hero from '../../components/mercado/MercadoV2Hero'
import MercadoV2Shell from '../../components/mercado/MercadoV2Shell'
import { v2 } from '../../components/mercado/mv2'
import { MERCADO_GEO, MERCADO_SEO } from '../../lib/mercado/home'
import { MERCADO_HOURS_ROWS } from '../../lib/mercado/market-hours'
import { mercadoAssetUrl } from '../../lib/mercado/meta'
import { mercadoStaticSrc } from '../../lib/mercado/assets'
import { mercadoV2HomePath } from '../../lib/mercado/paths'
import {
  MERCADO_V2_AREAS,
  MERCADO_V2_BENEFITS,
  MERCADO_V2_COPY,
  MERCADO_V2_SEO,
  MERCADO_V2_STORY,
  mercadoV2AreasMatching,
  mercadoV2HomeCanonical,
  serializeMercadoV2JsonLd,
} from '../../lib/mercado/v2'

type Props = { q: string; publicTenantLanding: true }

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const raw = ctx.query.q
  const q = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] ?? '' : ''
  return { props: { q, publicTenantLanding: true } }
}

export default function MercadoV2HomePage({ q }: Props) {
  const areas = q ? mercadoV2AreasMatching(q) : MERCADO_V2_AREAS
  const title = MERCADO_V2_SEO.title
  const description = MERCADO_V2_SEO.description
  const canonical = mercadoV2HomeCanonical()
  const ogImage = mercadoAssetUrl(MERCADO_V2_SEO.heroImage)
  const jsonLd = serializeMercadoV2JsonLd()
  const filtered = q.trim().length >= 2

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_HN" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="og:image:alt" content={MERCADO_V2_SEO.name} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="stylesheet" href="/mercado/v2.css?v=2" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </Head>
      <MercadoV2Shell searchQuery={q}>
        <MercadoV2Hero />

        <section id="beneficios" className={`${v2.story} ${v2.reveal}`}>
          <div className={v2.storyCopy}>
            <p className={v2.storyEyebrow}>{MERCADO_V2_STORY.kicker}</p>
            <h2 className={v2.storyTitle}>{MERCADO_V2_COPY.benefitsTitle}</h2>
            <p className={v2.storyBody}>{MERCADO_V2_STORY.body}</p>
          </div>
          <div className={v2.storyCollage}>
            <div className={`${v2.storyPhoto} ${v2.storyPhotoA}`}>
              <img
                src={mercadoStaticSrc(MERCADO_V2_STORY.photos[0].src)}
                alt={MERCADO_V2_STORY.photos[0].alt}
                width={900}
                height={700}
              />
            </div>
            <div className={`${v2.storyPhoto} ${v2.storyPhotoB}`}>
              <img
                src={mercadoStaticSrc(MERCADO_V2_STORY.photos[1].src)}
                alt={MERCADO_V2_STORY.photos[1].alt}
                width={700}
                height={520}
              />
            </div>
          </div>
          <div className={v2.benefitGrid}>
            {MERCADO_V2_BENEFITS.map((benefit) => (
              <article key={benefit.title} className={v2.benefitCard}>
                <span aria-hidden>{benefit.mark}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="encontraras" className={`${v2.section} ${v2.reveal}`}>
          <div className={v2.sectionHead}>
            <h2 className={v2.sectionTitle}>{MERCADO_V2_COPY.findTitle}</h2>
            <p className={v2.sectionLead}>
              {filtered
                ? `Áreas para “${q.trim()}”. ${MERCADO_V2_COPY.findBody}`
                : MERCADO_V2_COPY.findBody}
            </p>
            {filtered ? (
              <p className={v2.sectionLead}>
                <a href={`${mercadoV2HomePath()}#encontraras`}>{MERCADO_V2_COPY.catalogClear}</a>
              </p>
            ) : null}
          </div>
          {areas.length === 0 ? (
            <p className={v2.empty}>
              No hay un área que coincida con esa búsqueda. Probá con sopa, tomate, carne o ropa.
            </p>
          ) : (
            <div className={v2.bento}>
              {areas.map((area, index) => (
                <article
                  key={area.id}
                  id={area.id}
                  className={`${v2.bentoCard} ${index === 0 && areas.length > 2 ? v2.bentoFeatured : ''}`}
                >
                  <div className={v2.bentoPhotoWrap}>
                    <img
                      src={mercadoStaticSrc(area.image)}
                      alt={area.imageAlt}
                      className={v2.bentoPhoto}
                      width={800}
                      height={480}
                    />
                  </div>
                  <div className={v2.bentoBody}>
                    <p className={v2.bentoAisle}>{area.aisle}</p>
                    <h3>{area.title}</h3>
                    <p>{area.description}</p>
                    <a href={`${mercadoV2HomePath()}#visita`} className={v2.discover}>
                      {MERCADO_V2_COPY.discover}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="horarios" className={`${v2.section} ${v2.reveal}`}>
          <div className={v2.hoursPanel}>
            <h2 className={v2.sectionTitle}>{MERCADO_V2_COPY.hoursTitle}</h2>
            <table className={v2.hoursTable}>
              <caption className={v2.visuallyHidden}>Horario oficial del Mercado Municipal San Pablo</caption>
              <tbody>
                {MERCADO_HOURS_ROWS.map((row) => (
                  <tr key={row.days}>
                    <th scope="row">{row.days}</th>
                    <td>{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="visita" className={`${v2.section} ${v2.reveal}`}>
          <div className={v2.visitPanel}>
            <div>
              <h2 className={v2.sectionTitle}>{MERCADO_V2_COPY.visitTitle}</h2>
              <p className={v2.visitBody}>{MERCADO_V2_COPY.visitBody}</p>
              <p className={v2.geo}>{MERCADO_GEO.label}</p>
              <p className={v2.footerMuted}>{MERCADO_SEO.addressLine}</p>
              <div className={v2.visitActions}>
                <a
                  href={MERCADO_GEO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={v2.btnSolid}
                >
                  {MERCADO_V2_COPY.mapsCta}
                </a>
                <a href={`${mercadoV2HomePath()}#horarios`} className={v2.btnGhost}>
                  {MERCADO_V2_COPY.hoursCta}
                </a>
              </div>
            </div>
            <a
              href={MERCADO_GEO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={v2.mapTile}
            >
              Mapa: {MERCADO_GEO.landmark}
            </a>
          </div>
        </section>
      </MercadoV2Shell>
    </>
  )
}
