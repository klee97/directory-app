INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'test-user1@example.com',
  extensions.crypt('Testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()),
  NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NULL,
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated', 'test-user2@example.com',
  extensions.crypt('Testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated', 'test-user3@example.com',
  extensions.crypt('Testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000005',
  'authenticated', 'authenticated', 'test-user4@example.com',
  extensions.crypt('Testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'test-vendor1@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000006',
  'authenticated', 'authenticated', 'test-vendor2@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000007',
  'authenticated', 'authenticated', 'test-vendor3@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000008',
  'authenticated', 'authenticated', 'test-vendor4@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()), NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}', '{}', NULL,
  timezone('utc'::text, now()), timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000009',
  'authenticated', 'authenticated', 'delete-test@example.com',
  extensions.crypt('Testpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()),
  NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NULL,
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000000a',
  'authenticated', 'authenticated', 'delete-vendor-test@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
  timezone('utc'::text, now()),
  NULL, '', NULL, '', NULL, '', '', NULL, NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NULL,
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL
), (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000000b',
  'authenticated', 'authenticated', 'website-interest-vendor-test@example.com',
  extensions.crypt('Testvendorpassword123!', extensions.gen_salt('bf')),
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
  '00000000-0000-0000-0000-000000000001',
  '{"sub": "00000000-0000-0000-0000-000000000001"}',
  'email', '00000000-0000-0000-0000-000000000001',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '{"sub": "00000000-0000-0000-0000-000000000003"}',
  'email', '00000000-0000-0000-0000-000000000003',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  '{"sub": "00000000-0000-0000-0000-000000000004"}',
  'email', '00000000-0000-0000-0000-000000000004',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  '{"sub": "00000000-0000-0000-0000-000000000005"}',
  'email', '00000000-0000-0000-0000-000000000005',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '{"sub": "00000000-0000-0000-0000-000000000002"}',
  'email', '00000000-0000-0000-0000-000000000002',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006',
  '{"sub": "00000000-0000-0000-0000-000000000006"}',
  'email', '00000000-0000-0000-0000-000000000006',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000007',
  '{"sub": "00000000-0000-0000-0000-000000000007"}',
  'email', '00000000-0000-0000-0000-000000000007',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000008',
  '{"sub": "00000000-0000-0000-0000-000000000008"}',
  'email', '00000000-0000-0000-0000-000000000008',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000009',
  '{"sub": "00000000-0000-0000-0000-000000000009"}',
  'email', '00000000-0000-0000-0000-000000000009',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-00000000000a',
  '00000000-0000-0000-0000-00000000000a',
  '{"sub": "00000000-0000-0000-0000-00000000000a"}',
  'email', '00000000-0000-0000-0000-00000000000a',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
), (
  '00000000-0000-0000-0000-00000000000b',
  '00000000-0000-0000-0000-00000000000b',
  '{"sub": "00000000-0000-0000-0000-00000000000b"}',
  'email', '00000000-0000-0000-0000-00000000000b',
  timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())
);


-- -----------------------------------------------------------------------
-- E2E test fixtures
-- IDs prefixed with TEST- are included in dev/test environments only
-- (see shouldIncludeTestVendors in src/lib/env/env.ts)
-- -----------------------------------------------------------------------

-- Test vendors
INSERT INTO public.vendors (id, business_name, slug, include_in_directory, city, state, country, verified_at, approved_inquiries_at, website_interest_submitted)
VALUES
  ('TEST-E2E-001', 'Test Glamour Studio',   'test-glamour-studio',   true, 'New York',    'New York',   'United States', timezone('utc'::text, now()), timezone('utc'::text, now()), false),
  ('TEST-E2E-002', 'Test Bridal Beauty Co', 'test-bridal-beauty-co', true, 'Los Angeles', 'California', 'United States', null, null, false),
  ('TEST-E2E-003', 'Test Vendor 3', 'test-vendor-3', true, 'Boston', 'Massachusetts', 'United States of America', null, null, false),
  ('TEST-E2E-004', 'Test Vendor 4', 'test-vendor-4', true, 'Houston', 'Texas', 'United States of America', null, null, false),
  ('TEST-E2E-005', 'Test Throwaway Vendor', 'test-throwaway-vendor', false, 'Chicago', 'Illinois', 'United States', timezone('utc'::text, now()), timezone('utc'::text, now()), false),
  ('TEST-E2E-006', 'Test Website Interest Vendor', 'test-website-interest-vendor', false, 'Chicago', 'Illinois', 'United States', timezone('utc'::text, now()), timezone('utc'::text, now()), true)
  ;

-- Unclaimed vendor for magic-link claim tests (no auth user yet)
INSERT INTO public.vendors (id, business_name, slug, include_in_directory, city, state, country, email, access_token, verified_at, approved_inquiries_at)
VALUES
  ('TEST-E2E-CLAIM', 'Test Claim Vendor', 'test-claim-vendor', false, 'Seattle', 'Washington', 'United States', 'claim-vendor@example.com', '11111111-1111-1111-1111-111111111111', null, null);

-- Test tags  (style='primary' → Service chip; anything else → Skill chip)
INSERT INTO public.tags (id, name, display_name, is_visible, style)
VALUES
  ('e2e00000-0000-0000-0000-000000000001', 'SPECIALTY_HAIR', 'Hair',       true, 'primary'),
  ('e2e00000-0000-0000-0000-000000000002', 'SKILL_THAI',     'Thai Makeup', true, 'default'),
  ('e2e00000-0000-0000-0000-000000000003', 'SPECIALTY_MAKEUP', 'Makeup', true, 'primary');


-- Link vendors → tags
INSERT INTO public.vendor_tags (vendor_id, tag_id)
VALUES
  ('TEST-E2E-001', 'e2e00000-0000-0000-0000-000000000001'), -- Test Glamour Studio   → Hair (service)
  ('TEST-E2E-001', 'e2e00000-0000-0000-0000-000000000002'), -- Test Glamour Studio   → Thai Makeup (skill)
  ('TEST-E2E-002', 'e2e00000-0000-0000-0000-000000000001'), -- Test Bridal Beauty Co → Hair (service) only
  ('TEST-E2E-003', 'e2e00000-0000-0000-0000-000000000003'), -- Test Vendor 3 → Makeup (service) only
  ('TEST-E2E-004', 'e2e00000-0000-0000-0000-000000000003'); -- Test Vendor 4 → Makeup (service) only

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
  '00000000-0000-0000-0000-000000000001', 'user', now(), now(), false, null, true
), (
  '00000000-0000-0000-0000-000000000003', 'user', now(), now(), false, null, true
), (
  '00000000-0000-0000-0000-000000000004', 'user', now(), now(), false, null, true
), (
  '00000000-0000-0000-0000-000000000005', 'user', now(), now(), false, null, true
), (
  '00000000-0000-0000-0000-000000000002', 'vendor', now(), now(), false, 'TEST-E2E-001', true
), (
  '00000000-0000-0000-0000-000000000006', 'vendor', now(), now(), false, 'TEST-E2E-002', true
), (
  '00000000-0000-0000-0000-000000000007', 'vendor', now(), now(), false, 'TEST-E2E-003', true
), (
  '00000000-0000-0000-0000-000000000008', 'vendor', now(), now(), false, 'TEST-E2E-004', true
), (
  '00000000-0000-0000-0000-000000000009', 'user', now(), now(), false, null, true
), (
  '00000000-0000-0000-0000-00000000000a', 'vendor', now(), now(), false, 'TEST-E2E-005', true
), (
  '00000000-0000-0000-0000-00000000000b', 'vendor', now(), now(), false, 'TEST-E2E-006', true
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  vendor_id = EXCLUDED.vendor_id,
  is_admin = EXCLUDED.is_admin,
  is_test = EXCLUDED.is_test
;