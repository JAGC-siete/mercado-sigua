import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { MercadoInscriptionHeaderLink } from './InscriptionCta'
import MercadoFooter from './MercadoFooter'
import MercadoHowItWorks from './MercadoHowItWorks'
import { marketOpenStatus } from '../../lib/mercado/market-hours'
import { mercadoHomePath, mercadoInscriptionPath } from '../../lib/mercado/paths'
import { MERCADO_SEO } from '../../lib/mercado/home'
import styles from './mercado.module.css'

function homeAnchor(hash: string) {
  return `${mercadoHomePath()}#${hash}`
}

export default function MercadoPublicShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const showInscriptionLink = router.pathname !== mercadoInscriptionPath()
  const [status, setStatus] = useState(() => marketOpenStatus())

  useEffect(() => {
    setStatus(marketOpenStatus())
    const id = window.setInterval(() => setStatus(marketOpenStatus()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const nav = useMemo(
    () => [
      { href: homeAnchor('puestos'), label: 'Puestos' },
      { href: homeAnchor('categorias'), label: 'Categorías' },
      { href: homeAnchor('ubicacion'), label: 'Ubicación' },
    ],
    []
  )

  return (
    <div className={styles.shell}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={styles.stickyChrome}>
        <div
          className={`${styles.trust} ${status.open ? styles.trustOpen : styles.trustClosed}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`${styles.statusDot} ${status.open ? styles.statusDotOpen : styles.statusDotClosed}`}
            aria-hidden
          />
          {status.label}
        </div>

        <header className={styles.header}>
          <div className={styles.headerRow}>
            <Link href={mercadoHomePath()} className={styles.brand}>
              {MERCADO_SEO.name}
            </Link>

            <nav className={styles.headerNav} aria-label="Secciones del directorio">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className={styles.headerNavLink}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={styles.headerActions}>
              <MercadoHowItWorks />
              {showInscriptionLink ? <MercadoInscriptionHeaderLink /> : null}
            </div>
          </div>
        </header>
      </div>

      <main>{children}</main>
      <MercadoFooter />
    </div>
  )
}
