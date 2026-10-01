/**
 * Home del directorio público. Shell: isPublicTenantLandingRoute (/mercadosanpablosigua).
 * No usa AuthContext ni chrome de marketing de Humano SISU.
 * No pisa pages/index.tsx.
 */

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'
import MercadoPublicShell from '../../components/mercado/MercadoPublicShell'
import { MercadoInscriptionBanner } from '../../components/mercado/InscriptionCta'
import VendorCard from '../../components/mercado/VendorCard'
import styles from '../../components/mercado/mercado.module.css'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL,
  isVendorCategory,
  type VendorCategory,
} from '../../lib/mercado/categories'
import { VENDOR_CATEGORY_ICON } from '../../lib/mercado/category-icons'
import {
  MERCADO_FEATURED_GROUPS,
  MERCADO_GEO,
  MERCADO_HOME_COPY,
  MERCADO_SEO,
  mercadoSearchHints,
} from '../../lib/mercado/home'
import { mercadoShoppingCenterJsonLd, serializeJsonLd } from '../../lib/mercado/jsonld'
import {
  mercadoAssetUrl,
  mercadoCategoryTitle,
  mercadoHomeCanonical,
  mercadoHomeDescription,
  mercadoHomeTitle,
} from '../../lib/mercado/meta'
import { MERCADO_HOW_IT_WORKS_STEPS } from '../../lib/mercado/how-it-works'
import { mercadoHomePath, mercadoVendorPath } from '../../lib/mercado/paths'
import { mercadoStaticSrc } from '../../lib/mercado/assets'
import type { PublicVendorCard } from '../../lib/mercado/schema'
import {
  MERCADO_ISR_REVALIDATE_SECONDS,
  resolvePublicVendors,
} from '../../lib/mercado/vendors-db'

interface MercadoHomeProps {
  vendors: PublicVendorCard[]
  source: 'database' | 'preview'
}

export default function MercadoHomePage({ vendors }: MercadoHomeProps) {
  const router = useRouter()
  const rawCategory = typeof router.query.categoria === 'string' ? router.query.categoria : ''
  const category: VendorCategory | null = isVendorCategory(rawCategory) ? rawCategory : null
  const [search, setSearch] = useState('')
  const [hintsOpen, setHintsOpen] = useState(false)

  useEffect(() => {
    if (typeof router.query.q === 'string') setSearch(router.query.q)
  }, [router.query.q])

  const byCategory = useMemo(() => {
    if (!category) return vendors
    return vendors.filter((vendor) => vendor.category === category)
  }, [vendors, category])

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return byCategory
    return byCategory.filter((vendor) => {
      const haystack = [
        vendor.name,
        vendor.description,
        VENDOR_CATEGORY_LABEL[vendor.category],
        vendor.stallLocation ?? '',
        ...vendor.products,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [byCategory, search])

  const grouped = useMemo(() => {
    if (category || search.trim()) return null
    const used = new Set<string>()
    const groups = MERCADO_FEATURED_GROUPS.map((group) => ({
      heading: group.heading,
      vendors: group.slugs
        .map((slug) => visible.find((vendor) => vendor.slug === slug))
        .filter((vendor): vendor is PublicVendorCard => Boolean(vendor)),
    })).filter((group) => {
      group.vendors.forEach((vendor) => used.add(vendor.slug))
      return group.vendors.length > 0
    })
    const rest = visible.filter((vendor) => !used.has(vendor.slug))
    return { groups, rest }
  }, [visible, category, search])

  const hints = useMemo(() => mercadoSearchHints(search), [search])

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHintsOpen(false)
    const nextQuery: Record<string, string> = {}
    if (category) nextQuery.categoria = category
    if (search.trim()) nextQuery.q = search.trim()
    void router.push({ pathname: mercadoHomePath(), query: nextQuery }, undefined, { shallow: true })
  }

  const title = category ? mercadoCategoryTitle(category) : mercadoHomeTitle()
  const description = mercadoHomeDescription()
  const canonical = mercadoHomeCanonical()
  const ogImage = mercadoAssetUrl(MERCADO_SEO.heroImage)
  const jsonLd = mercadoShoppingCenterJsonLd(vendors)

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
        {ogImage && <meta property="og:image:alt" content={MERCADO_SEO.name} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </Head>
      <MercadoPublicShell>
        <section
          className={styles.hero}
          style={{
            backgroundImage: `url(${mercadoStaticSrc(MERCADO_SEO.heroImage)})`,
          }}
        >
          <div className={styles.heroInner}>
            <p className={styles.heroEyebrow}>Siguatepeque, Comayagua</p>
            <h1 className={styles.heroTitle}>{MERCADO_HOME_COPY.h1}</h1>
            <p className={styles.heroLead}>{MERCADO_SEO.tagline}</p>
            <form
              onSubmit={onSearchSubmit}
              className={styles.searchForm}
              role="search"
            >
              <div className={styles.searchBar}>
                <Search className="ml-4 h-6 w-6 shrink-0 text-stone-400" aria-hidden />
                <label htmlFor="mercado-search" className="sr-only">
                  ¿De qué tienes ganas hoy?
                </label>
                <input
                  id="mercado-search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setHintsOpen(true)
                  }}
                  onFocus={() => setHintsOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setHintsOpen(false), 120)
                  }}
                  placeholder="¿De qué tienes ganas hoy? Caldo, tomate, carnita…"
                  className="h-14 min-w-0 flex-1 border-0 bg-transparent px-4 text-lg text-stone-800 shadow-none ring-0 placeholder:text-stone-400 focus:border-0 focus:outline-none focus:ring-0"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={hintsOpen && hints.length > 0}
                  aria-controls="mercado-search-hints"
                />
                <button type="submit" className={styles.searchSubmit}>
                  Buscar
                </button>
              </div>
              {hintsOpen && hints.length > 0 && (
                <ul id="mercado-search-hints" role="listbox" className={styles.searchHints}>
                  {hints.map((hint) => (
                    <li key={hint.label} role="option">
                      <Link href={mercadoVendorPath(hint.slug)} className={styles.searchHintLink}>
                        {hint.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
        </section>

        <section className={`${styles.homeSection} mx-auto max-w-6xl px-4 pt-12`}>
          <h2 className={styles.sectionTitle}>{MERCADO_HOME_COPY.traditionTitle}</h2>
          <p className="mt-3 max-w-3xl" style={{ color: 'var(--mercado-muted)' }}>
            {MERCADO_HOME_COPY.traditionBody}
          </p>
        </section>

        <section id="puestos" className={`${styles.homeSection} mx-auto max-w-6xl px-4 py-12`}>
          <h2 className={`${styles.sectionTitle} mb-3`}>
            {category
              ? VENDOR_CATEGORY_LABEL[category]
              : search.trim()
                ? 'Puestos destacados'
                : MERCADO_HOME_COPY.producerTitle}
          </h2>
          {!category && !search.trim() && (
            <p className="mb-6 max-w-3xl" style={{ color: 'var(--mercado-muted)' }}>
              {MERCADO_HOME_COPY.producerBody}
            </p>
          )}
          {visible.length === 0 ? (
            <p
              className="rounded-xl border px-4 py-10 text-center"
              style={{ borderColor: 'var(--mercado-line)', color: 'var(--mercado-muted)' }}
            >
              No hay puestos que coincidan con esa búsqueda.
            </p>
          ) : grouped ? (
            <div className="grid gap-10">
              {grouped.groups.map((group) => (
                <div key={group.heading}>
                  <h3 className={styles.groupTitle}>{group.heading}</h3>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.vendors.map((vendor) => (
                      <VendorCard key={vendor.slug} vendor={vendor} titleAs="p" />
                    ))}
                  </div>
                </div>
              ))}
              {grouped.rest.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped.rest.map((vendor) => (
                    <VendorCard key={vendor.slug} vendor={vendor} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((vendor) => (
                <VendorCard key={vendor.slug} vendor={vendor} />
              ))}
            </div>
          )}
        </section>

        <section id="como-comprar" className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-12`}>
          <div className={styles.panelLocal}>
            <h2 className={styles.sectionTitle}>{MERCADO_HOME_COPY.howToBuyTitle}</h2>
            <p className="mt-3 max-w-3xl" style={{ color: 'var(--mercado-muted)' }}>
              {MERCADO_HOME_COPY.howToBuyBody}
            </p>
            <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3" style={{ color: 'var(--mercado-muted)' }}>
              {MERCADO_HOW_IT_WORKS_STEPS.map((step) => (
                <li key={step.n}>
                  <strong style={{ color: 'var(--mercado-cacao)' }}>
                    {step.n}. {step.title}
                  </strong>
                  <p className="mt-1">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="categorias" className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-12`}>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className={styles.sectionTitle}>Categorías</h2>
            {category && (
              <Link
                href={mercadoHomePath()}
                className="text-sm font-semibold underline"
                style={{ color: 'var(--mercado-chile)' }}
              >
                Ver todas
              </Link>
            )}
          </div>
          <div className={styles.categoryStrip}>
            {VENDOR_CATEGORIES.map((key) => {
              const active = category === key
              const Icon = VENDOR_CATEGORY_ICON[key]
              return (
                <Link
                  key={key}
                  href={{ pathname: mercadoHomePath(), query: { categoria: key } }}
                  className={`${styles.categoryCard} ${active ? styles.categoryCardActive : ''}`}
                >
                  <span className={styles.categoryIcon} aria-hidden>
                    <Icon className="h-9 w-9" strokeWidth={1.75} />
                  </span>
                  <p>{VENDOR_CATEGORY_LABEL[key]}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <MercadoInscriptionBanner />

        <section
          id="como-funciona-locatarios"
          className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-12`}
        >
          <div className={styles.panelLocal}>
            <h2 className={styles.sectionTitle}>Cómo aparece tu ficha (locatarios)</h2>
            <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-3" style={{ color: 'var(--mercado-muted)' }}>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>1. Solicitud</strong>
                <p className="mt-1">
                  Enviás el local, WhatsApp y el plan. El básico es gratis; el VIP se coordina aparte.
                </p>
              </li>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>2. Revisión</strong>
                <p className="mt-1">El equipo revisa a mano y arma la ficha Pickup.</p>
              </li>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>3. Publicación</strong>
                <p className="mt-1">Tu puesto queda visible para que te pidan por WhatsApp.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="ubicacion" className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-16`}>
          <div className={`${styles.panelLocal} flex flex-col items-start gap-8 md:flex-row md:items-center`}>
            <div className="flex-1">
              <h2 className={styles.sectionTitle}>¿Cómo llegar al mercado?</h2>
              <p className="mt-4" style={{ color: 'var(--mercado-ink)' }}>
                {MERCADO_GEO.howToArrive}
              </p>
              <p
                className="mt-4 inline-block rounded-lg px-4 py-2 font-mono text-sm"
                style={{ background: '#fff', color: 'var(--mercado-muted)' }}
              >
                {MERCADO_GEO.label}
              </p>
              <div className="mt-4">
                <a
                  href={MERCADO_GEO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaSolid}
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>
            <a
              href={MERCADO_GEO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-48 w-full items-center justify-center rounded-xl border text-center text-sm md:w-1/3"
              style={{
                borderColor: 'var(--mercado-line)',
                background: '#fff',
                color: 'var(--mercado-muted)',
              }}
            >
              Mapa: {MERCADO_GEO.landmark}
            </a>
          </div>
        </section>
      </MercadoPublicShell>
    </>
  )
}

export const getStaticProps: GetStaticProps<MercadoHomeProps> = async () => {
  const resolved = await resolvePublicVendors(null)

  return {
    props: {
      vendors: resolved.vendors,
      source: resolved.source,
    },
    revalidate: MERCADO_ISR_REVALIDATE_SECONDS,
  }
}
