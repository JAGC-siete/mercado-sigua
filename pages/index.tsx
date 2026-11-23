/**
 * Home de Mercado Digital de Siguatepeque: directorio público de negocios en /.
 * Solo fichas reales de la base; sin filas pinta el estado vacío con CTA de inscripción.
 */

import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'
import MercadoPublicShell from '../components/mercado/MercadoPublicShell'
import { MercadoInscriptionBanner } from '../components/mercado/InscriptionCta'
import VendorCard from '../components/mercado/VendorCard'
import styles from '../components/mercado/mercado.module.css'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL,
  isVendorCategory,
  type VendorCategory,
} from '../lib/mercado/categories'
import { VENDOR_CATEGORY_ICON } from '../lib/mercado/category-icons'
import { MERCADO_HOME_COPY, MERCADO_SEO } from '../lib/mercado/home'
import { mercadoDirectoryJsonLd, serializeJsonLd } from '../lib/mercado/jsonld'
import {
  mercadoAssetUrl,
  mercadoCategoryTitle,
  mercadoHomeCanonical,
  mercadoHomeDescription,
  mercadoHomeTitle,
} from '../lib/mercado/meta'
import { MERCADO_HOW_IT_WORKS_STEPS } from '../lib/mercado/how-it-works'
import { mercadoHomePath, mercadoInscriptionPath, mercadoV2HomePath } from '../lib/mercado/paths'
import { mercadoStaticSrc } from '../lib/mercado/assets'
import type { PublicVendorCard } from '../lib/mercado/schema'
import {
  MERCADO_ISR_REVALIDATE_SECONDS,
  resolvePublicVendors,
} from '../lib/mercado/vendors-db'

interface MercadoHomeProps {
  vendors: PublicVendorCard[]
}

export default function MercadoHomePage({ vendors }: MercadoHomeProps) {
  const router = useRouter()
  const rawCategory = typeof router.query.categoria === 'string' ? router.query.categoria : ''
  const category: VendorCategory | null = isVendorCategory(rawCategory) ? rawCategory : null
  const [search, setSearch] = useState('')

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

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextQuery: Record<string, string> = {}
    if (category) nextQuery.categoria = category
    if (search.trim()) nextQuery.q = search.trim()
    void router.push({ pathname: mercadoHomePath(), query: nextQuery }, undefined, { shallow: true })
  }

  const title = category ? mercadoCategoryTitle(category) : mercadoHomeTitle()
  const description = mercadoHomeDescription()
  const canonical = mercadoHomeCanonical()
  const ogImage = mercadoAssetUrl(MERCADO_SEO.heroImage)
  const jsonLd = mercadoDirectoryJsonLd(vendors)

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
        <meta property="og:site_name" content={MERCADO_SEO.name} />
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
                  ¿Qué buscas hoy?
                </label>
                <input
                  id="mercado-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="¿Qué buscas hoy? Comida, ropa, abarrotes…"
                  className="h-14 min-w-0 flex-1 border-0 bg-transparent px-4 text-lg text-stone-800 shadow-none ring-0 placeholder:text-stone-400 focus:border-0 focus:outline-none focus:ring-0"
                  autoComplete="off"
                />
                <button type="submit" className={styles.searchSubmit}>
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={`${styles.homeSection} mx-auto max-w-6xl px-4 pt-12`}>
          <h2 className={styles.sectionTitle}>{MERCADO_HOME_COPY.introTitle}</h2>
          <p className="mt-3 max-w-3xl" style={{ color: 'var(--mercado-muted)' }}>
            {MERCADO_HOME_COPY.introBody}
          </p>
        </section>

        <section id="negocios" className={`${styles.homeSection} mx-auto max-w-6xl px-4 py-12`}>
          <h2 className={`${styles.sectionTitle} mb-3`}>
            {category
              ? VENDOR_CATEGORY_LABEL[category]
              : search.trim()
                ? 'Resultados de tu búsqueda'
                : MERCADO_HOME_COPY.directoryTitle}
          </h2>
          {!category && !search.trim() && (
            <p className="mb-6 max-w-3xl" style={{ color: 'var(--mercado-muted)' }}>
              {MERCADO_HOME_COPY.directoryBody}
            </p>
          )}
          {vendors.length === 0 ? (
            <div
              className="rounded-xl border px-4 py-10 text-center"
              style={{ borderColor: 'var(--mercado-line)', color: 'var(--mercado-muted)' }}
            >
              <p>{MERCADO_HOME_COPY.emptyDirectory}</p>
              <Link href={mercadoInscriptionPath()} className={`${styles.ctaSolid} mt-4`}>
                Inscribir mi negocio
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <p
              className="rounded-xl border px-4 py-10 text-center"
              style={{ borderColor: 'var(--mercado-line)', color: 'var(--mercado-muted)' }}
            >
              No hay negocios que coincidan con esa búsqueda.
            </p>
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
          id="como-funciona-negocios"
          className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-12`}
        >
          <div className={styles.panelLocal}>
            <h2 className={styles.sectionTitle}>Cómo aparece tu negocio</h2>
            <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-3" style={{ color: 'var(--mercado-muted)' }}>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>1. Solicitud</strong>
                <p className="mt-1">
                  Envías el nombre, el WhatsApp y el plan. El registro básico es gratis; la
                  inscripción destacada cuesta L. 1,500 al año.
                </p>
              </li>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>2. Revisión</strong>
                <p className="mt-1">Revisamos tu solicitud a mano y armamos tu ficha.</p>
              </li>
              <li>
                <strong style={{ color: 'var(--mercado-cacao)' }}>3. Publicación</strong>
                <p className="mt-1">Tu negocio queda visible para que te escriban por WhatsApp.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="mercado-san-pablo" className={`${styles.homeSection} mx-auto max-w-6xl px-4 pb-16`}>
          <div className={`${styles.panelLocal} flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between`}>
            <div className="max-w-2xl">
              <h2 className={styles.sectionTitle}>{MERCADO_HOME_COPY.sanPabloTitle}</h2>
              <p className="mt-3" style={{ color: 'var(--mercado-muted)' }}>
                {MERCADO_HOME_COPY.sanPabloBody}
              </p>
            </div>
            <Link href={mercadoV2HomePath()} className={styles.ctaSolid}>
              {MERCADO_HOME_COPY.sanPabloCta}
            </Link>
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
    },
    revalidate: MERCADO_ISR_REVALIDATE_SECONDS,
  }
}
