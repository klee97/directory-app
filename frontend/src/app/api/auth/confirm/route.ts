import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  const isVendor = redirectTo.includes('partner')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      const successRedirectUrl = new URL(redirectTo, request.url)
      successRedirectUrl.searchParams.set('message', 'Email verification code successfully verified!')
      redirect(successRedirectUrl.toString())
    } else {
      console.error('Error verifying email verification code:', error.message);
    }
  }

  // redirect the user to an error page with some instructions
  if (type === 'recovery') {
    redirect(isVendor ? '/partner/auth/recovery-code-error' : '/auth/recovery-code-error')
  }
  redirect(isVendor ? '/partner/auth/auth-code-error' : '/auth/auth-code-error')
}