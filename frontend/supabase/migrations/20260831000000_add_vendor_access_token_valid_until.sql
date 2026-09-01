ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS access_token_valid_until timestamp with time zone;

COMMENT ON COLUMN public.vendors.access_token_valid_until IS
  'Expiry for access_token (vendor claim magic link). Stamped by requestClaimLink to now() + ACCESS_TOKEN_VALID_DURATION. NULL means the token predates expiry tracking and is treated as expired.';
