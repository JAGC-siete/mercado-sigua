/**
 * Perfil público de un puesto. ISR para SEO + CDN.
 * Shell: isPublicTenantLandingRoute (/mercadosanpablosigua/[slug]).
 * DB primero; preview hardcodeado si no hay fichas activas.
 */

import Head from 'next/head'
import type { GetStaticPaths, GetStaticProps } from 'next'
import MercadoPublicShell from '../../components/mercado/MercadoPublicShell'
import VendorLanding from '../../components/mercado/VendorLanding'
import { mercadoVendorJsonLd, serializeJsonLd } from '../../lib/mercado/jsonld'
import {
  mercadoAssetUrl,
  mercadoVendorCanonical,
  mercadoVendorDescription,
  mercadoVendorTitle,
} from '../../lib/mercado/meta'
import type { PublicVendorCard } from '../../lib/mercado/schema'
import {
  MERCADO_ISR_REVALIDATE_SECONDS,
  listActiveVendorSlugsFromDb,
  previewVendorSlugs,
  resolvePublicVendor,
} from '../../lib/mercado/vendors-db'

interface VendorProfileProps {
  vendor: PublicVendorCard
}

export default function MercadoVendorProfilePage({ vendor }: VendorProfileProps) {
  const title = mercadoVendorTitle(vendor)
  const description = mercadoVendorDescription(vendor)
  const canonical = mercadoVendorCanonical(vendor.slug)
  const ogImage = mercadoAssetUrl(vendor.logoUrl)
  const jsonLd = mercadoVendorJsonLd(vendor)

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
        {ogImage && <meta property="og:image:alt" content={vendor.name} />}
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
        <VendorLanding vendor={vendor} />
      </MercadoPublicShell>
    </>
  )
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const getStaticPaths: GetStaticPaths = async () => {
  const dbSlugs = await listActiveVendorSlugsFromDb()
  const slugs = dbSlugs.length > 0 ? dbSlugs : previewVendorSlugs()

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<VendorProfileProps> = async (ctx) => {
  const raw = ctx.params?.slug
  const slug = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase().trim() ?? ''

  if (!slug || !SLUG_PATTERN.test(slug) || slug.length > 63) {
    return { notFound: true, revalidate: MERCADO_ISR_REVALIDATE_SECONDS }
  }

  const resolved = await resolvePublicVendor(slug)
  if (!resolved.vendor) {
    return { notFound: true, revalidate: MERCADO_ISR_REVALIDATE_SECONDS }
  }

  return {
    props: { vendor: resolved.vendor },
    revalidate: MERCADO_ISR_REVALIDATE_SECONDS,
  }
}
