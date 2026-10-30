import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient } from '@/lib/supabase/clients/serverClient'
import { getBaseUrl } from '@/lib/env/env'

enum EmailType {
  EMAIL = 'email',
  RECOVERY = 'recovery',
  EMAIL_CHANGE = 'email_change',
  UNKNOWN = 'unknown',
}

const successMessage = {
  [EmailType.EMAIL]: 'Email verified successfully!',
  [EmailType.RECOVERY]: 'Password recovery code successfully verified!',
  [EmailType.EMAIL_CHANGE]: 'Email change successfully verified!',
  [EmailType.UNKNOWN]: 'Verification successful!',
};

/** Resolve redirectTo against our own origin; fall back to '/' if it points elsewhere. */
function resolveSafeRedirect(redirectTo: string): URL {
  const base = new URL(getBaseUrl())
  try {
    const url = new URL(redirectTo, base)
    if (url.origin === base.origin) return url
  } catch { }
  return new URL('/', base)
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const isVendor = redirectTo.includes('partner')
  const emailType = type ? (type as EmailType) : EmailType.UNKNOWN
  const base = getBaseUrl()

  if (emailType === EmailType.UNKNOWN) {
    console.error('Unknown email OTP type received:', type)
  }

  // Collect the cache headers supabase wants applied, then attach them to whichever response we return.
  const authHeaders: Record<string, string> = {}
  const redirectTo_ = (url: URL | string) => {
    const response = NextResponse.redirect(url)
    Object.entries(authHeaders).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

  if (token_hash && type) {
    const supabaseServerClient = await createServerClient({
      onHeaders: (headers) => Object.assign(authHeaders, headers),
    })

    const { error } = await supabaseServerClient.auth.verifyOtp({ type, token_hash })

    if (!error) {
      const successUrl = resolveSafeRedirect(redirectTo)
      successUrl.searchParams.set('message', successMessage[emailType])
      return redirectTo_(successUrl)
    }
    console.error('Error verifying email verification code:', error.message)
  }

  const errorPath =
    type === EmailType.RECOVERY
      ? (isVendor ? '/partner/auth/recovery-code-error' : '/auth/recovery-code-error')
      : (isVendor ? '/partner/auth/auth-code-error' : '/auth/auth-code-error')

  return redirectTo_(new URL(errorPath, base))
}