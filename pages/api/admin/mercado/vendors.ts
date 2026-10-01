/**
 * CRUD operador de fichas mercado_vendors.
 * Guard: JWT super_admin. Escritura: service role.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireSuperAdmin } from '../../../../lib/auth/api-auth'
import { normalizeLoginEmail } from '../../../../lib/auth/role-access'
import { logger } from '../../../../lib/logger'
import { VENDOR_APPLICATIONS_TABLE } from '../../../../lib/mercado/inscription-schema'
import {
  DEFAULT_VENDOR_PAYMENT_METHODS,
  VENDORS_TABLE,
  parseCreateVendor,
  parseUpdateVendor,
  vendorStatusSchema,
} from '../../../../lib/mercado/schema'
import {
  VENDOR_ADMIN_COLUMNS,
  createMercadoAdminClient,
  publicCardToInsert,
  type VendorRow,
  vendorRowToPublicCard,
} from '../../../../lib/mercado/vendors-db'
import { revalidateMercadoPages } from '../../../../lib/mercado/revalidate'

const patchFlagsSchema = z.object({
  id: z.string().uuid(),
  status: vendorStatusSchema.optional(),
  featured: z.boolean().optional(),
}).refine((v) => v.status !== undefined || v.featured !== undefined, {
  message: 'Indicá status o featured.',
})

const promoteSchema = z.object({
  applicationId: z.string().uuid(),
  name: z.string().optional(),
  slug: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  whatsapp: z.string(),
  stallLocation: z.string().optional(),
  hoursNote: z.string().optional(),
  contactEmail: z.string().optional(),
  products: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  logoUrl: z.string().optional(),
  gallery: z
    .array(z.object({ src: z.string(), alt: z.string() }))
    .optional(),
  status: vendorStatusSchema.optional(),
  featured: z.boolean().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST', 'PATCH'].includes(req.method ?? '')) {
    res.setHeader('Allow', 'GET, POST, PATCH')
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const operator = await requireSuperAdmin(req, res, `mercado.vendors.${req.method}`)
  if (!operator) return
  const operatorEmail = operator.email || operator.userId

  const adminClient = createMercadoAdminClient()

  try {
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from(VENDORS_TABLE)
        .select(VENDOR_ADMIN_COLUMNS)
        .order('featured', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(500)

      if (error) {
        logger.error('mercado vendors list', { error: error.message })
        return res.status(500).json({ error: 'No se pudieron cargar las fichas' })
      }

      return res.status(200).json({ vendors: data ?? [] })
    }

    if (req.method === 'PATCH') {
      const flags = patchFlagsSchema.safeParse(req.body)
      if (flags.success && !('name' in (req.body ?? {})) && !('slug' in (req.body ?? {}))) {
        const patch: Record<string, unknown> = { updated_by: operatorEmail }
        if (flags.data.status !== undefined) patch.status = flags.data.status
        if (flags.data.featured !== undefined) patch.featured = flags.data.featured

        const { data, error } = await adminClient
          .from(VENDORS_TABLE)
          .update(patch)
          .eq('id', flags.data.id)
          .select(VENDOR_ADMIN_COLUMNS)
          .maybeSingle()

        if (error) {
          logger.error('mercado vendor flags', { error: error.message })
          return res.status(500).json({ error: 'No se pudo actualizar' })
        }
        if (!data) return res.status(404).json({ error: 'Ficha no encontrada' })
        await revalidateMercadoPages(res, (data as VendorRow).slug)
        return res.status(200).json({ vendor: data })
      }

      const parsed = parseUpdateVendor(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
      }
      const id = typeof req.body?.id === 'string' ? req.body.id : null
      if (!id) return res.status(400).json({ error: 'Falta id de la ficha.' })

      const u = parsed.data
      const update: Record<string, unknown> = { updated_by: operatorEmail }
      if (u.name !== undefined) update.name = u.name
      if (u.slug !== undefined) update.slug = u.slug
      if (u.category !== undefined) update.category = u.category
      if (u.description !== undefined) update.description = u.description
      if (u.whatsapp !== undefined) update.whatsapp = u.whatsapp
      if (u.logoUrl !== undefined) update.logo_url = u.logoUrl
      if (u.stallLocation !== undefined) update.stall_location = u.stallLocation
      if (u.hoursNote !== undefined) update.hours_note = u.hoursNote
      if (u.contactEmail !== undefined) {
        update.contact_email = u.contactEmail
          ? normalizeLoginEmail(u.contactEmail)
          : null
      }
      if (u.products !== undefined) update.products = u.products
      if (u.paymentMethods !== undefined) update.payment_methods = u.paymentMethods
      if (u.gallery !== undefined) update.gallery = u.gallery
      if (u.status !== undefined) update.status = u.status
      if (u.featured !== undefined) update.featured = u.featured

      const { data, error } = await adminClient
        .from(VENDORS_TABLE)
        .update(update)
        .eq('id', id)
        .select(VENDOR_ADMIN_COLUMNS)
        .maybeSingle()

      if (error) {
        logger.error('mercado vendor update', { error: error.message })
        return res.status(500).json({ error: 'No se pudo guardar la ficha' })
      }
      if (!data) return res.status(404).json({ error: 'Ficha no encontrada' })
      await revalidateMercadoPages(res, (data as VendorRow).slug)
      return res.status(200).json({ vendor: data })
    }

    if (req.body?.applicationId) {
      const promoted = promoteSchema.safeParse(req.body)
      if (!promoted.success) {
        return res.status(400).json({
          error: promoted.error.issues[0]?.message ?? 'Datos de promoción inválidos',
        })
      }

      const { data: application, error: appErr } = await adminClient
        .from(VENDOR_APPLICATIONS_TABLE)
        .select('id, stall_number, merchant_name, business_name, status, vendor_id')
        .eq('id', promoted.data.applicationId)
        .maybeSingle()

      if (appErr || !application) {
        return res.status(404).json({ error: 'Solicitud no encontrada' })
      }
      if (application.vendor_id) {
        return res.status(409).json({ error: 'Esa solicitud ya tiene ficha.' })
      }

      const name = (promoted.data.name ?? application.business_name).trim()
      const createBody = {
        name,
        slug: promoted.data.slug,
        category: promoted.data.category ?? 'otros',
        description:
          promoted.data.description ??
          `${name} en el Mercado Municipal San Pablo. Pedí por WhatsApp y recogé en el local.`,
        whatsapp: promoted.data.whatsapp,
        stallLocation: promoted.data.stallLocation ?? application.stall_number,
        hoursNote: promoted.data.hoursNote ?? 'Lun–Sáb 6:00–15:00',
        contactEmail: promoted.data.contactEmail,
        products: promoted.data.products ?? ['Consultar por WhatsApp'],
        paymentMethods: promoted.data.paymentMethods ?? [...DEFAULT_VENDOR_PAYMENT_METHODS],
        logoUrl: promoted.data.logoUrl,
        gallery: promoted.data.gallery ?? [],
        status: promoted.data.status ?? 'active',
        featured: promoted.data.featured ?? false,
      }

      const parsed = parseCreateVendor(createBody)
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
      }

      const insert = publicCardToInsert({
        ...parsed.data,
        logoUrl: parsed.data.logoUrl ?? null,
        stallLocation: parsed.data.stallLocation ?? null,
        hoursNote: parsed.data.hoursNote ?? null,
        contactEmail: parsed.data.contactEmail ?? null,
        gallery: parsed.data.gallery ?? [],
        applicationId: application.id,
        userId: operatorEmail,
      })

      const { data: vendor, error: insertErr } = await adminClient
        .from(VENDORS_TABLE)
        .insert(insert)
        .select(VENDOR_ADMIN_COLUMNS)
        .single()

      if (insertErr || !vendor) {
        logger.error('mercado promote insert', { error: insertErr?.message })
        return res.status(500).json({ error: 'No se pudo crear la ficha' })
      }

      await adminClient
        .from(VENDOR_APPLICATIONS_TABLE)
        .update({ status: 'approved', vendor_id: vendor.id })
        .eq('id', application.id)

      await revalidateMercadoPages(res, (vendor as VendorRow).slug)

      return res.status(201).json({
        vendor,
        card: vendorRowToPublicCard(vendor as VendorRow),
      })
    }

    const parsed = parseCreateVendor(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    }

    const insert = publicCardToInsert({
      ...parsed.data,
      logoUrl: parsed.data.logoUrl ?? null,
      stallLocation: parsed.data.stallLocation ?? null,
      hoursNote: parsed.data.hoursNote ?? null,
      contactEmail: parsed.data.contactEmail ?? null,
      gallery: parsed.data.gallery ?? [],
      userId: operatorEmail,
    })

    const { data: vendor, error } = await adminClient
      .from(VENDORS_TABLE)
      .insert(insert)
      .select(VENDOR_ADMIN_COLUMNS)
      .single()

    if (error || !vendor) {
      logger.error('mercado vendor create', { error: error?.message })
      return res.status(500).json({ error: 'No se pudo crear la ficha' })
    }

    await revalidateMercadoPages(res, (vendor as VendorRow).slug)
    return res.status(201).json({ vendor })
  } catch (error: unknown) {
    if (res.headersSent) return
    logger.error('mercado vendors API', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return res.status(500).json({ error: 'Error interno' })
  }
}
