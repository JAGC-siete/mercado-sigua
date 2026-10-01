import type { AppProps } from 'next/app'
import { Montserrat } from 'next/font/google'
import SessionIdleGuard from '../components/mercado/SessionIdleGuard'
import { cn } from '../lib/utils'
import '../styles/globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={cn(montserrat.variable, 'min-h-screen font-sans')}>
      <Component {...pageProps} />
      <SessionIdleGuard />
    </div>
  )
}
