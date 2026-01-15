/**
 * Environment detection utilities for Vercel and local development
 * Works in both browser and server contexts
 */

/**
 * Get the current environment
 * Server: Uses VERCEL_ENV and NODE_ENV
 * Browser: Uses NEXT_PUBLIC_VERCEL_ENV or hostname detection as fallback
 */
export const getEnvironment = (): 'development' | 'preview' | 'production' => {
  // Browser environment detection
  if (typeof window !== 'undefined') {
    // Primary method: Use NEXT_PUBLIC_VERCEL_ENV (set to $VERCEL_ENV in Vercel settings)
    const publicVercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV as 'development' | 'preview' | 'production' | undefined
    if (publicVercelEnv) {
      return publicVercelEnv
    }

    // Fallback: hostname detection (for cases where env var isn't set)
    const hostname = window.location.hostname

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return 'development'
    }

    // If we can't determine from hostname, default to preview as safe fallback
    // This ensures we don't accidentally expose preview/test data
    return 'preview'
  }

  // Server environment detection
  // VERCEL_ENV is automatically set by Vercel to 'development', 'preview', or 'production'
  const vercelEnv = process.env.VERCEL_ENV as 'development' | 'preview' | 'production' | undefined
  const nodeEnv = process.env.NODE_ENV

  if (vercelEnv) {
    return vercelEnv
  }

  // Local fallback: Use NODE_ENV
  return nodeEnv === 'production' ? 'production' : 'development'
}

export const isDevelopment = () => {
  return getEnvironment() === 'development'
}

export const isPreview = () => {
  return getEnvironment() === 'preview'
}

export const isProduction = () => {
  return getEnvironment() === 'production'
}

export const isDevOrPreview = () => {
  const env = getEnvironment()
  return env === 'development' || env === 'preview'
}

export const shouldIncludeFuturePosts = () => {
  // Include future posts in development and preview environments
  return isDevOrPreview()
}

/**
 * Client-side helper for UI decisions only (e.g., showing test badges)
 * WARNING: This should NOT be used for authoritative data filtering.
 * Use server actions for actual data access control.
 */
export const shouldIncludeTestVendors = () => {
  // Include test vendors in development and preview environments
  return isDevOrPreview()
}

export const isTestVendor = (vendorId: string): boolean => {
  return vendorId.startsWith('TEST-')
}

export const shouldEnableAnalytics = () => {
  const env = getEnvironment()

  // Check for explicit overrides first
  if (process.env.NEXT_PUBLIC_FORCE_ENABLE_ANALYTICS === 'true') {
    return true
  }

  if (process.env.NEXT_PUBLIC_FORCE_DISABLE_ANALYTICS === 'true') {
    return false
  }

  // Default behavior: only enable analytics in production
  // Disable in development and preview to avoid polluting analytics data
  return env === 'production'
}

export const getAnalyticsConfig = () => {
  const enabled = shouldEnableAnalytics()
  const env = getEnvironment()

  return {
    enabled,
    environment: env,
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    microsoftClarityId: process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID,
  }
}

// Debug helper for development
export const logEnvironmentInfo = () => {
  const info = {
    context: typeof window === 'undefined' ? 'server' : 'browser',
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    detected: getEnvironment(),
    isDevelopment: isDevelopment(),
    isPreview: isPreview(),
    isProduction: isProduction(),
    shouldIncludeFuturePosts: shouldIncludeFuturePosts(),
    shouldIncludeTestVendors: shouldIncludeTestVendors(),
    shouldEnableAnalytics: shouldEnableAnalytics(),
  }

  console.log('Environment Info:', info)
  return info
}

export const getBaseUrl = () => {
  const baseUrl = isDevelopment() ? "http://localhost:3000"
    : (isPreview() ? `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
      : `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`)

  console.log("Base URL:", baseUrl);
  return baseUrl
};