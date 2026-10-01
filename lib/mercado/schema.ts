/**
 * Contratos Zod del alta/edición de vendedores (admin tenant).
 * Los comparte el formulario y, en el siguiente incremento, el API.
 */

import { z } from 'zod'
import { VENDOR_CATEGORIES } from './categories'
import { RESERVED_VENDOR_SLUGS, slugifyVendorName } from './slug'

export const VENDOR_STATUSES = ['active', 'inactive'] as const
export type VendorStatus = (typeof VENDOR_STATUSES)[number]

export const VENDORS_TABLE = 'mercado_vendors'

function optionalFilled<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }, schema.optional())
}

export const vendorNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre del negocio necesita al menos 2 caracteres.')
  .max(80, 'El nombre no puede pasar de 80 caracteres.')

export const vendorDescriptionSchema = z
  .string()
  .trim()
  .min(10, 'La descripción necesita al menos 10 caracteres.')
  .max(500, 'La descripción no puede pasar de 500 caracteres.')

export const vendorCategorySchema = z.enum(VENDOR_CATEGORIES, {
  message: 'Elige una categoría.',
})

export const vendorStatusSchema = z.enum(VENDOR_STATUSES, {
  message: 'El estado debe ser activo o inactivo.',
})

export const vendorSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'El slug necesita al menos 3 caracteres.')
  .max(63, 'El slug no puede pasar de 63 caracteres.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones simples.')
  .refine((value) => !RESERVED_VENDOR_SLUGS.includes(value), {
    message: 'Ese slug está reservado. Elige otro.',
  })

export const vendorWhatsappSchema = z
  .string()
  .trim()
  .min(8, 'Incluye un número de WhatsApp.')
  .max(30, 'El WhatsApp no puede pasar de 30 caracteres.')
  .refine((value) => (value.match(/\d/g) || []).length >= 7, {
    message: 'Incluye un número real de teléfono o WhatsApp.',
  })

/** https absoluta o ruta interna. Bloquea javascript:, data:, http. */
export const vendorLogoUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      (value.startsWith('/') && !value.startsWith('//')) ||
      (value.startsWith('https://') && z.string().url().safeParse(value).success),
    { message: 'Usa una URL https o una ruta interna que empiece con /.' }
  )

export const vendorStallLocationSchema = z
  .string()
  .trim()
  .min(2, 'La ubicación necesita al menos 2 caracteres.')
  .max(80, 'La ubicación no puede pasar de 80 caracteres.')

export const vendorHoursNoteSchema = z
  .string()
  .trim()
  .min(2, 'El horario necesita al menos 2 caracteres.')
  .max(80, 'El horario no puede pasar de 80 caracteres.')

export const vendorProductNameSchema = z
  .string()
  .trim()
  .min(2, 'Cada producto necesita al menos 2 caracteres.')
  .max(40, 'Cada producto no puede pasar de 40 caracteres.')

export const vendorProductsSchema = z
  .array(vendorProductNameSchema)
  .min(1, 'Incluí al menos 1 producto principal.')
  .max(5, 'Máximo 5 productos principales.')

export const VENDOR_PAYMENT_METHODS = ['efectivo', 'transferencia_bac'] as const
export type VendorPaymentMethod = (typeof VENDOR_PAYMENT_METHODS)[number]

export const DEFAULT_VENDOR_PAYMENT_METHODS: VendorPaymentMethod[] = [
  'efectivo',
  'transferencia_bac',
]

export const vendorPaymentMethodSchema = z.enum(VENDOR_PAYMENT_METHODS, {
  message: 'Elegí efectivo o transferencia BAC.',
})

export const vendorPaymentMethodsSchema = z
  .array(vendorPaymentMethodSchema)
  .min(1, 'Elegí al menos un método de pago.')
  .max(4)
  .transform((methods) => [...new Set(methods)])

export const vendorGalleryItemSchema = z.object({
  src: vendorLogoUrlSchema,
  alt: z.string().trim().min(2, 'Cada foto necesita un texto alternativo.').max(80),
})

export const vendorGallerySchema = z.array(vendorGalleryItemSchema).max(4)

function compactStringList(value: unknown) {
  if (!Array.isArray(value)) return value
  return value.filter((item) => typeof item === 'string' && item.trim() !== '')
}

const createVendorFields = {
  name: vendorNameSchema,
  slug: optionalFilled(vendorSlugSchema),
  category: vendorCategorySchema,
  description: vendorDescriptionSchema,
  whatsapp: vendorWhatsappSchema,
  logoUrl: optionalFilled(vendorLogoUrlSchema),
  stallLocation: optionalFilled(vendorStallLocationSchema),
  hoursNote: optionalFilled(vendorHoursNoteSchema),
  products: z.preprocess(compactStringList, vendorProductsSchema),
  paymentMethods: z.preprocess(
    (value) => (value === undefined || value === null ? DEFAULT_VENDOR_PAYMENT_METHODS : value),
    vendorPaymentMethodsSchema.default(DEFAULT_VENDOR_PAYMENT_METHODS)
  ),
  gallery: z.preprocess((value) => (value === undefined || value === null ? [] : value), vendorGallerySchema.default([])),
  status: vendorStatusSchema.default('active'),
  featured: z.boolean().default(false),
}

export const createVendorSchema = z.object(createVendorFields)

export type CreateVendorInput = z.infer<typeof createVendorSchema>
export type CreateVendorPayload = Omit<CreateVendorInput, 'slug'> & { slug: string }

export const updateVendorSchema = z
  .object({
    name: vendorNameSchema.optional(),
    slug: vendorSlugSchema.optional(),
    category: vendorCategorySchema.optional(),
    description: vendorDescriptionSchema.optional(),
    whatsapp: vendorWhatsappSchema.optional(),
    logoUrl: vendorLogoUrlSchema.nullable().optional(),
    stallLocation: vendorStallLocationSchema.nullable().optional(),
    hoursNote: vendorHoursNoteSchema.nullable().optional(),
    products: vendorProductsSchema.optional(),
    paymentMethods: vendorPaymentMethodsSchema.optional(),
    gallery: vendorGallerySchema.optional(),
    status: vendorStatusSchema.optional(),
    featured: z.boolean().optional(),
  })
  .refine(
    (payload) =>
      payload.name !== undefined ||
      payload.slug !== undefined ||
      payload.category !== undefined ||
      payload.description !== undefined ||
      payload.whatsapp !== undefined ||
      payload.logoUrl !== undefined ||
      payload.stallLocation !== undefined ||
      payload.hoursNote !== undefined ||
      payload.products !== undefined ||
      payload.paymentMethods !== undefined ||
      payload.gallery !== undefined ||
      payload.status !== undefined ||
      payload.featured !== undefined,
    { message: 'No hay cambios que guardar.' }
  )

export type UpdateVendorInput = z.input<typeof updateVendorSchema>

export function parseCreateVendor(body: unknown) {
  const parsed = createVendorSchema.safeParse(body)
  if (!parsed.success) return parsed

  const slugSource = parsed.data.slug ?? slugifyVendorName(parsed.data.name)
  const slugCheck = vendorSlugSchema.safeParse(slugSource)
  if (!slugCheck.success) return slugCheck

  return {
    success: true as const,
    data: {
      ...parsed.data,
      slug: slugCheck.data,
    },
  }
}

export function parseUpdateVendor(body: unknown) {
  return updateVendorSchema.safeParse(body)
}

export const publicVendorCardSchema = z.object({
  slug: vendorSlugSchema,
  name: vendorNameSchema,
  category: vendorCategorySchema,
  description: vendorDescriptionSchema,
  whatsapp: vendorWhatsappSchema.nullable(),
  logoUrl: vendorLogoUrlSchema.nullable(),
  stallLocation: vendorStallLocationSchema.nullable(),
  hoursNote: vendorHoursNoteSchema.nullable(),
  products: vendorProductsSchema,
  paymentMethods: vendorPaymentMethodsSchema,
  gallery: vendorGallerySchema,
  featured: z.boolean(),
})

export type PublicVendorCard = z.infer<typeof publicVendorCardSchema>
