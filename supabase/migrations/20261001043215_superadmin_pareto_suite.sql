-- Pareto Superadmin Suite: VIP lifecycle, site settings, WA click events.

-- 1) VIP / aportación on vendors
ALTER TABLE public.mercado_vendors
  ADD COLUMN IF NOT EXISTS vip_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS vip_notes text;

COMMENT ON COLUMN public.mercado_vendors.vip_expires_at IS
  'Vencimiento de aportación VIP anual. featured=true es el beneficio de ranking.';
COMMENT ON COLUMN public.mercado_vendors.vip_notes IS
  'Notas manuales del operador sobre la aportación VIP.';

CREATE INDEX IF NOT EXISTS idx_mercado_vendors_vip_featured_expires
  ON public.mercado_vendors (vip_expires_at)
  WHERE featured = true AND vip_expires_at IS NOT NULL;

-- 2) Singleton site settings (reads/writes via service role in Next.js)
CREATE TABLE IF NOT EXISTS public.mercado_site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  force_closed boolean NOT NULL DEFAULT false,
  support_whatsapp text,
  hours_override jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

COMMENT ON TABLE public.mercado_site_settings IS
  'Config global del directorio (1 fila). Escritura solo service role.';

ALTER TABLE public.mercado_site_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mercado_site_settings FROM anon, authenticated;

INSERT INTO public.mercado_site_settings (id, force_closed)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- 3) WhatsApp click events (append-only; inserts via service role)
CREATE TABLE IF NOT EXISTS public.mercado_wa_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.mercado_vendors (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mercado_wa_clicks_vendor_created
  ON public.mercado_wa_clicks (vendor_id, created_at DESC);

COMMENT ON TABLE public.mercado_wa_clicks IS
  'Clicks en Pedir y Recoger / Reservar por WhatsApp. Sin PII.';

ALTER TABLE public.mercado_wa_clicks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.mercado_wa_clicks FROM anon, authenticated;
