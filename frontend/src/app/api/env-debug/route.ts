import { NextResponse } from 'next/server'
import { getEnvironment } from '@/lib/env/env'

export async function GET() {
  const envInfo = {
    detected: getEnvironment(),
    VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    VERCEL_URL: process.env.VERCEL_URL || 'undefined',
    // Only include NEXT_PUBLIC vars that should be visible
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'undefined',
  }

  return NextResponse.json(envInfo)
}

// Optional: Remove in production or add authentication
export const dynamic = 'force-dynamic' // Don't cache this endpoint