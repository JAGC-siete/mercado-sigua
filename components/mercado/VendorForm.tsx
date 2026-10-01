import { useState, type FormEvent } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABEL, type VendorCategory } from '../../lib/mercado/categories'
import { VENDOR_PAYMENT_METHOD_LABEL } from '../../lib/mercado/payments'
import { MERCADO_VENDORS_UPLOAD_API_PATH } from '../../lib/mercado/paths'
import {
  DEFAULT_VENDOR_PAYMENT_METHODS,
  parseCreateVendor,
  type CreateVendorPayload,
  type VendorPaymentMethod,
  type VendorStatus,
} from '../../lib/mercado/schema'
import { slugifyVendorName } from '../../lib/mercado/slug'

const fieldClass = 'bg-white/10 text-white placeholder:text-gray-400'

export interface VendorFormValues {
  name: string
  slug: string
  category: VendorCategory | ''
  description: string
  whatsapp: string
  logoUrl: string
  facadeUrl: string
  stallLocation: string
  hoursNote: string
  products: string[]
  paymentMethods: VendorPaymentMethod[]
  status: VendorStatus
  featured: boolean
}

const EMPTY_VALUES: VendorFormValues = {
  name: '',
  slug: '',
  category: '',
  description: '',
  whatsapp: '',
  logoUrl: '',
  facadeUrl: '',
  stallLocation: '',
  hoursNote: '',
  products: ['', '', '', '', ''],
  paymentMethods: [...DEFAULT_VENDOR_PAYMENT_METHODS],
  status: 'active',
  featured: false,
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

async function uploadImage(kind: 'logo' | 'facade' | 'product', file: File) {
  const dataBase64 = await fileToBase64(file)
  const res = await fetch(MERCADO_VENDORS_UPLOAD_API_PATH, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      contentType: file.type,
      dataBase64,
    }),
  })
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string; alt?: string }
  if (!res.ok || !json.url) throw new Error(json.error || 'No se pudo subir')
  return { url: json.url, alt: json.alt || kind }
}

export default function VendorForm({
  initialValues,
  submitLabel,
  onValid,
  busy,
}: {
  initialValues?: Partial<VendorFormValues>
  submitLabel: string
  onValid: (payload: CreateVendorPayload) => void | Promise<void>
  busy?: boolean
}) {
  const [values, setValues] = useState<VendorFormValues>(() => ({
    ...EMPTY_VALUES,
    ...initialValues,
    products: [...(initialValues?.products ?? EMPTY_VALUES.products), '', '', '', '', ''].slice(0, 5),
    paymentMethods: initialValues?.paymentMethods ?? [...DEFAULT_VENDOR_PAYMENT_METHODS],
  }))
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug))
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  const effectiveSlug = slugTouched ? values.slug : slugifyVendorName(values.name)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const gallery = values.facadeUrl
      ? [{ src: values.facadeUrl, alt: `Fachada de ${values.name || 'el puesto'}` }]
      : []
    const parsed = parseCreateVendor({
      name: values.name,
      slug: effectiveSlug,
      category: values.category,
      description: values.description,
      whatsapp: values.whatsapp,
      logoUrl: values.logoUrl,
      stallLocation: values.stallLocation,
      hoursNote: values.hoursNote,
      products: values.products,
      paymentMethods: values.paymentMethods,
      gallery,
      status: values.status,
      featured: values.featured,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }
    setError(null)
    await onValid(parsed.data)
  }

  async function onUpload(kind: 'logo' | 'facade', file: File | undefined) {
    if (!file) return
    setUploading(kind)
    setError(null)
    try {
      const uploaded = await uploadImage(kind, file)
      setValues((current) =>
        kind === 'logo'
          ? { ...current, logoUrl: uploaded.url }
          : { ...current, facadeUrl: uploaded.url }
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(null)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="vendor-name" className="mb-1 block text-sm font-medium text-gray-200">
          Nombre del negocio
        </label>
        <Input
          id="vendor-name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          placeholder="Comedor El Patio"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="vendor-slug" className="mb-1 block text-sm font-medium text-gray-200">
          Slug SEO
        </label>
        <Input
          id="vendor-slug"
          value={effectiveSlug}
          onChange={(event) => {
            setSlugTouched(true)
            setValues((current) => ({ ...current, slug: event.target.value }))
          }}
          placeholder="comedor-el-patio"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="vendor-category" className="mb-1 block text-sm font-medium text-gray-200">
          Categoría
        </label>
        <select
          id="vendor-category"
          value={values.category}
          onChange={(event) =>
            setValues((current) => ({ ...current, category: event.target.value as VendorCategory }))
          }
          className={`h-10 w-full rounded-lg border border-white/20 px-3 ${fieldClass}`}
        >
          <option value="">Elegí una categoría</option>
          {VENDOR_CATEGORIES.map((key) => (
            <option key={key} value={key}>
              {VENDOR_CATEGORY_LABEL[key]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="vendor-description" className="mb-1 block text-sm font-medium text-gray-200">
          Descripción
        </label>
        <Textarea
          id="vendor-description"
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          placeholder="Qué vende el puesto y en qué pasillo está."
          className={fieldClass}
          rows={4}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-200">5 productos principales</legend>
        <div className="grid gap-2">
          {values.products.map((product, index) => (
            <Input
              key={index}
              id={`vendor-product-${index}`}
              value={product}
              onChange={(event) =>
                setValues((current) => {
                  const products = [...current.products]
                  products[index] = event.target.value
                  return { ...current, products }
                })
              }
              placeholder={index === 0 ? 'Lomo de res' : `Producto ${index + 1}`}
              className={fieldClass}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="vendor-whatsapp" className="mb-1 block text-sm font-medium text-gray-200">
          WhatsApp del puesto
        </label>
        <Input
          id="vendor-whatsapp"
          value={values.whatsapp}
          onChange={(event) => setValues((current) => ({ ...current, whatsapp: event.target.value }))}
          placeholder="9999-0000"
          inputMode="tel"
          className={fieldClass}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-200">Métodos de pago</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['efectivo', 'transferencia_bac'] as VendorPaymentMethod[]).map((method) => {
            const checked = values.paymentMethods.includes(method)
            return (
              <label
                key={method}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setValues((current) => {
                      const paymentMethods = checked
                        ? current.paymentMethods.filter((item) => item !== method)
                        : [...current.paymentMethods, method]
                      return { ...current, paymentMethods }
                    })
                  }
                />
                {VENDOR_PAYMENT_METHOD_LABEL[method]}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Logo / retrato</label>
          <Input
            value={values.logoUrl}
            onChange={(event) => setValues((current) => ({ ...current, logoUrl: event.target.value }))}
            placeholder="URL o subí archivo"
            className={fieldClass}
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-xs text-gray-300"
            onChange={(event) => void onUpload('logo', event.target.files?.[0])}
          />
          {uploading === 'logo' ? <p className="mt-1 text-xs text-amber-200">Subiendo…</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">
            Foto de fachada (pickup)
          </label>
          <Input
            value={values.facadeUrl}
            onChange={(event) =>
              setValues((current) => ({ ...current, facadeUrl: event.target.value }))
            }
            placeholder="URL o subí archivo"
            className={fieldClass}
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-xs text-gray-300"
            onChange={(event) => void onUpload('facade', event.target.files?.[0])}
          />
          {uploading === 'facade' ? <p className="mt-1 text-xs text-amber-200">Subiendo…</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vendor-stall" className="mb-1 block text-sm font-medium text-gray-200">
            Ubicación en el mercado
          </label>
          <Input
            id="vendor-stall"
            value={values.stallLocation}
            onChange={(event) =>
              setValues((current) => ({ ...current, stallLocation: event.target.value }))
            }
            placeholder="Pasillo 1, local 8"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="vendor-hours" className="mb-1 block text-sm font-medium text-gray-200">
            Horario
          </label>
          <Input
            id="vendor-hours"
            value={values.hoursNote}
            onChange={(event) => setValues((current) => ({ ...current, hoursNote: event.target.value }))}
            placeholder="Lun–Sáb 6:00–15:00"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Visibilidad</label>
          <select
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({ ...current, status: event.target.value as VendorStatus }))
            }
            className={`h-10 w-full rounded-lg border border-white/20 px-3 ${fieldClass}`}
          >
            <option value="active">Activo (público)</option>
            <option value="inactive">Inactivo (baja)</option>
          </select>
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) =>
              setValues((current) => ({ ...current, featured: event.target.checked }))
            }
          />
          Destacado (aportación anual al día)
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={busy || Boolean(uploading)}>
        {busy ? 'Guardando…' : submitLabel}
      </Button>
    </form>
  )
}
