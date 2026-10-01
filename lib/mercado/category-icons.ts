import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Drumstick,
  Footprints,
  Leaf,
  MoreHorizontal,
  Palette,
  Shirt,
  ShoppingBag,
  Soup,
  Wheat,
  Wrench,
} from 'lucide-react'
import type { VendorCategory } from './categories'

/** Iconos mínimos para escanear categorías (mercado local, no dashboard). */
export const VENDOR_CATEGORY_ICON: Record<VendorCategory, LucideIcon> = {
  comida: Soup,
  verduras: Leaf,
  frutas: Apple,
  carnes: Drumstick,
  granos: Wheat,
  abarrotes: ShoppingBag,
  ropa: Shirt,
  calzado: Footprints,
  artesanias: Palette,
  servicios: Wrench,
  otros: MoreHorizontal,
}
