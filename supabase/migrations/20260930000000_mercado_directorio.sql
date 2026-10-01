-- Función de updated_at. En Webycitas vivía en leads_sites_inquiries.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Directorio Mercado Municipal San Pablo.
-- Sin companies, sin company_id, sin user_profiles, sin puente a leads/sites.
-- Lectura pública: fichas active. Escritura: service role (APIs de /app/mercado).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mercado_vendor_status') THEN
    CREATE TYPE public.mercado_vendor_status AS ENUM ('active', 'inactive');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mercado_vendor_application_status') THEN
    CREATE TYPE public.mercado_vendor_application_status AS ENUM (
      'received',
      'reviewed',
      'approved',
      'rejected'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.mercado_vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stall_number text NOT NULL,
  merchant_name text NOT NULL,
  business_name text NOT NULL,
  whatsapp text NOT NULL,
  presence_plan text NOT NULL DEFAULT 'basic',
  authorized_at timestamptz NOT NULL,
  authorization_text text,
  status public.mercado_vendor_application_status NOT NULL DEFAULT 'received',
  source text NOT NULL DEFAULT 'mercado-public',
  notified_at timestamptz,
  vendor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mercado_vendor_applications_stall_number_len CHECK (
    length(trim(stall_number)) BETWEEN 1 AND 40
  ),
  CONSTRAINT mercado_vendor_applications_merchant_name_len CHECK (
    length(trim(merchant_name)) BETWEEN 2 AND 80
  ),
  CONSTRAINT mercado_vendor_applications_business_name_len CHECK (
    length(trim(business_name)) BETWEEN 2 AND 80
  ),
  CONSTRAINT mercado_vendor_applications_whatsapp_len CHECK (
    length(trim(whatsapp)) BETWEEN 8 AND 30
  ),
  CONSTRAINT mercado_vendor_applications_whatsapp_digits CHECK (
    length(regexp_replace(whatsapp, '\D', '', 'g')) >= 7
  ),
  CONSTRAINT mercado_vendor_applications_presence_plan_allowed CHECK (
    presence_plan IN ('basic', 'featured_vip')
  ),
  CONSTRAINT mercado_vendor_applications_authorization_text_len CHECK (
    authorization_text IS NULL
    OR length(trim(authorization_text)) BETWEEN 20 AND 500
  ),
  CONSTRAINT mercado_vendor_applications_source_len CHECK (
    length(trim(source)) BETWEEN 3 AND 40
  )
);

COMMENT ON TABLE public.mercado_vendor_applications IS
  'Solicitudes de inscripción al directorio municipal. Insert solo con service role. No publica fichas. No toca leads ni sites.';

CREATE TABLE IF NOT EXISTS public.mercado_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.mercado_vendor_applications(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  whatsapp text NOT NULL,
  status public.mercado_vendor_status NOT NULL DEFAULT 'active',
  logo_url text,
  stall_location text,
  hours_note text,
  featured boolean NOT NULL DEFAULT false,
  products text[] NOT NULL DEFAULT ARRAY[]::text[],
  payment_methods text[] NOT NULL DEFAULT ARRAY['efectivo', 'transferencia_bac']::text[],
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by text,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mercado_vendors_name_len CHECK (length(trim(name)) BETWEEN 2 AND 80),
  CONSTRAINT mercado_vendors_slug_format CHECK (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 63
  ),
  CONSTRAINT mercado_vendors_description_len CHECK (length(trim(description)) BETWEEN 10 AND 500),
  CONSTRAINT mercado_vendors_category_allowed CHECK (
    category IN (
      'comida', 'verduras', 'frutas', 'carnes', 'granos', 'abarrotes',
      'ropa', 'calzado', 'artesanias', 'servicios', 'otros'
    )
  ),
  CONSTRAINT mercado_vendors_whatsapp_len CHECK (length(trim(whatsapp)) BETWEEN 8 AND 30),
  CONSTRAINT mercado_vendors_logo_url_len CHECK (logo_url IS NULL OR length(logo_url) <= 500),
  CONSTRAINT mercado_vendors_stall_location_len CHECK (
    stall_location IS NULL OR length(trim(stall_location)) BETWEEN 2 AND 80
  ),
  CONSTRAINT mercado_vendors_hours_note_len CHECK (
    hours_note IS NULL OR length(trim(hours_note)) BETWEEN 2 AND 80
  ),
  CONSTRAINT mercado_vendors_products_len CHECK (cardinality(products) <= 5),
  CONSTRAINT mercado_vendors_payment_methods_allowed CHECK (
    cardinality(payment_methods) >= 1
    AND payment_methods <@ ARRAY['efectivo', 'transferencia_bac']::text[]
  ),
  CONSTRAINT mercado_vendors_gallery_len CHECK (
    jsonb_typeof(gallery) = 'array'
    AND jsonb_array_length(gallery) <= 4
  )
);

ALTER TABLE public.mercado_vendor_applications
  DROP CONSTRAINT IF EXISTS mercado_vendor_applications_vendor_fk;
ALTER TABLE public.mercado_vendor_applications
  ADD CONSTRAINT mercado_vendor_applications_vendor_fk
  FOREIGN KEY (vendor_id) REFERENCES public.mercado_vendors(id) ON DELETE SET NULL;

COMMENT ON TABLE public.mercado_vendors IS
  'Fichas públicas del Mercado Municipal San Pablo. Sin company_id. Sin puente a sites.';

CREATE UNIQUE INDEX IF NOT EXISTS mercado_vendors_slug_uidx ON public.mercado_vendors (slug);
CREATE UNIQUE INDEX IF NOT EXISTS mercado_vendors_application_id_uidx
  ON public.mercado_vendors (application_id)
  WHERE application_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mercado_vendors_status_featured
  ON public.mercado_vendors (status, featured DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mercado_vendors_status_category
  ON public.mercado_vendors (status, category);

CREATE UNIQUE INDEX IF NOT EXISTS mercado_vendor_applications_vendor_id_uidx
  ON public.mercado_vendor_applications (vendor_id)
  WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mercado_vendor_applications_status_created_at
  ON public.mercado_vendor_applications (status, created_at DESC);

DROP TRIGGER IF EXISTS mercado_vendors_set_updated_at ON public.mercado_vendors;
CREATE TRIGGER mercado_vendors_set_updated_at
  BEFORE UPDATE ON public.mercado_vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS mercado_vendor_applications_set_updated_at ON public.mercado_vendor_applications;
CREATE TRIGGER mercado_vendor_applications_set_updated_at
  BEFORE UPDATE ON public.mercado_vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.mercado_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_vendor_applications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.mercado_vendors FROM anon, authenticated;
REVOKE ALL ON public.mercado_vendor_applications FROM anon, authenticated;

GRANT USAGE ON TYPE public.mercado_vendor_status TO anon, authenticated;

GRANT SELECT (
  id, name, slug, description, category, whatsapp, status,
  logo_url, stall_location, hours_note, products, payment_methods,
  gallery, featured, updated_at, created_at
) ON public.mercado_vendors TO anon;

DROP POLICY IF EXISTS mercado_vendors_public_select ON public.mercado_vendors;
CREATE POLICY mercado_vendors_public_select
  ON public.mercado_vendors
  FOR SELECT TO anon
  USING (status = 'active');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mercado-san-pablo',
  'mercado-san-pablo',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS mercado_san_pablo_public_read ON storage.objects;
CREATE POLICY mercado_san_pablo_public_read
  ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'mercado-san-pablo');
