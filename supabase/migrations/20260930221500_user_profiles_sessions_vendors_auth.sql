-- Auth unificado Mercado: user_profiles, user_sessions, claim de locatario.
-- Sin companies, sin leads/sites, sin roles HR.

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_role_allowed CHECK (role IN ('super_admin', 'vendor'))
);

COMMENT ON TABLE public.user_profiles IS
  'Perfiles de Auth para operador municipal (super_admin) y locatario (vendor).';

DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_profiles FROM anon, authenticated;
GRANT SELECT (id, role, is_active, permissions, created_at, updated_at)
  ON public.user_profiles TO authenticated;

DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own
  ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_activity timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  ua_hash text,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
  ON public.user_sessions (user_id, last_activity DESC)
  WHERE revoked_at IS NULL;

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_sessions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id uuid,
  p_ttl_hours integer DEFAULT 12,
  p_ip_hash text DEFAULT NULL,
  p_ua_hash text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;

  INSERT INTO public.user_sessions (user_id, expires_at, last_activity, ip_hash, ua_hash)
  VALUES (
    p_user_id,
    now() + make_interval(hours => GREATEST(p_ttl_hours, 1)),
    now(),
    p_ip_hash,
    p_ua_hash
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_session_activity(
  p_session_id uuid,
  p_idle_minutes integer DEFAULT 90
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.user_sessions%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.user_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_row.revoked_at IS NOT NULL THEN
    RETURN false;
  END IF;

  IF v_row.expires_at < now() THEN
    RETURN false;
  END IF;

  IF v_row.last_activity < now() - make_interval(mins => GREATEST(p_idle_minutes, 1)) THEN
    RETURN false;
  END IF;

  UPDATE public.user_sessions
  SET last_activity = now()
  WHERE id = p_session_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.create_user_session(uuid, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_session_activity(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_user_session(uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_session_activity(uuid, integer) TO service_role;

ALTER TABLE public.mercado_vendors
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

ALTER TABLE public.mercado_vendors
  DROP CONSTRAINT IF EXISTS mercado_vendors_contact_email_format;
ALTER TABLE public.mercado_vendors
  ADD CONSTRAINT mercado_vendors_contact_email_format CHECK (
    contact_email IS NULL
    OR (
      length(trim(contact_email)) BETWEEN 5 AND 160
      AND position('@' in contact_email) > 1
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS mercado_vendors_auth_user_id_uidx
  ON public.mercado_vendors (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS mercado_vendors_contact_email_uidx
  ON public.mercado_vendors (lower(contact_email))
  WHERE contact_email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.current_vendor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.mercado_vendors
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_vendor_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_vendor_id() TO authenticated, service_role;

GRANT SELECT (
  id, name, slug, description, category, whatsapp, status,
  logo_url, stall_location, hours_note, products, payment_methods,
  gallery, featured, contact_email, claimed_at, updated_at, created_at
) ON public.mercado_vendors TO authenticated;

DROP POLICY IF EXISTS mercado_vendors_vendor_select ON public.mercado_vendors;
CREATE POLICY mercado_vendors_vendor_select
  ON public.mercado_vendors
  FOR SELECT TO authenticated
  USING (id = public.current_vendor_id());

DROP POLICY IF EXISTS mercado_vendors_vendor_update ON public.mercado_vendors;
CREATE POLICY mercado_vendors_vendor_update
  ON public.mercado_vendors
  FOR UPDATE TO authenticated
  USING (id = public.current_vendor_id())
  WITH CHECK (id = public.current_vendor_id());
