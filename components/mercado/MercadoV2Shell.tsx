import type { ReactNode } from 'react'
import MercadoV2Chrome from './MercadoV2Chrome'
import MercadoV2Footer from './MercadoV2Footer'
import { v2 } from './mv2'

export default function MercadoV2Shell({
  children,
  searchQuery = '',
}: {
  children: ReactNode
  searchQuery?: string
}) {
  return (
    <div className={v2.page} id="top">
      <MercadoV2Chrome searchQuery={searchQuery} />
      <main>{children}</main>
      <MercadoV2Footer />
    </div>
  )
}
