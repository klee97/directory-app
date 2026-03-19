INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'test-user@example.com',
  extensions.crypt('testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()),
  NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NULL,
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{"sub": "00000000-0000-0000-0000-000000000001"}',
  'email',
  '00000000-0000-0000-0000-000000000001',
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
);

-- Create matching profile
INSERT INTO public.profiles (
  id,
  role,
  created_at,
  updated_at,
  is_admin,
  vendor_id,
  is_test
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user',
  now(),
  now(),
  false,
  null,
  true  -- marks this as a test account
);

-- -----------------------------------------------------------------------
-- E2E test fixtures
-- IDs prefixed with TEST- are included in dev/test environments only
-- (see shouldIncludeTestVendors in src/lib/env/env.ts)
-- -----------------------------------------------------------------------

-- Test vendors
INSERT INTO public.vendors (id, business_name, slug, include_in_directory, city, state, country)
VALUES
  ('TEST-E2E-001', 'Test Glamour Studio',   'test-glamour-studio',   true, 'New York',    'New York',   'United States'),
  ('TEST-E2E-002', 'Test Bridal Beauty Co', 'test-bridal-beauty-co', true, 'Los Angeles', 'California', 'United States');

-- Test tags  (style='primary' → Service chip; anything else → Skill chip)
INSERT INTO public.tags (id, name, display_name, is_visible, style)
VALUES
  ('e2e00000-0000-0000-0000-000000000001', 'SPECIALTY_HAIR', 'Hair',       true, 'primary'),
  ('e2e00000-0000-0000-0000-000000000002', 'SKILL_THAI',     'Thai Makeup', true, 'default');

-- Link vendors → tags
INSERT INTO public.vendor_tags (vendor_id, tag_id)
VALUES
  ('TEST-E2E-001', 'e2e00000-0000-0000-0000-000000000001'), -- Test Glamour Studio  → Thai Makeup (skill)
  ('TEST-E2E-001', 'e2e00000-0000-0000-0000-000000000002'), -- Test Glamour Studio  → Hair (service)
  ('TEST-E2E-002', 'e2e00000-0000-0000-0000-000000000002'); -- Test Bridal Beauty Co → Hair (service)