-- The shared dev database also hosts the HR/payroll schema, which owns its own
-- public.user_profiles (company_id + HR roles). Move the sites profile table out
-- of that name. Guarded: only renames the sites table (has `permissions`, no
-- `company_id`), so it is a no-op if already renamed or if the HR table is there.
-- Policies, grants, indexes and constraints follow the table (bound by OID).

DO $$
BEGIN
  IF to_regclass('public.site_user_profiles') IS NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'permissions'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'company_id'
     )
  THEN
    ALTER TABLE public.user_profiles RENAME TO site_user_profiles;
  END IF;
END
$$;
