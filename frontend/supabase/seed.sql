-- Create test user in Supabase auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-user@example.com',
  extensions.crypt('testpassword123!', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated'
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