/**
 * Environment detection utilities for Vercel and local development
 * Works in both browser and server contexts
 */

/**
 * Get the current environment
 * Server: Uses VERCEL_ENV and NODE_ENV
 * Browser: Uses hostname detection or NEXT_PUBLIC_VERCEL_ENV
 */
/**
 * Get the current environment
 * Server: Uses VERCEL_ENV and NODE_ENV
 * Browser: Uses hostname detection or NEXT_PUBLIC_VERCEL_ENV
 */
export const getEnvironment = (): 'development' | 'preview' | 'production' => {
  // Browser environment detection
  if (typeof window !== 'undefined') {
    // First try the public env var if set (most reliable method)
    const publicVercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV as 'development' | 'preview' | 'production' | undefined
    if (publicVercelEnv) {
      return publicVercelEnv
    }
    
    // Fallback to hostname detection
    const hostname = window.location.hostname
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development'
    }
    
    // Production custom domain (update with your actual production domain)
    if (hostname === 'yourdomain.com' || hostname === 'www.yourdomain.com') {
      return 'production'
    }
    
    // For vercel.app domains, we can't reliably distinguish between preview and production
    // based on hostname alone. Default to 'preview' as a safe fallback.
    // IMPORTANT: Set NEXT_PUBLIC_VERCEL_ENV=$VERCEL_ENV in Vercel settings for accurate detection
    if (hostname.includes('vercel.app')) {
      return 'preview'
    }
    
    // Unknown domain - assume preview to be safe
    return 'preview'
  }
  
  // Server environment detection
  // VERCEL_ENV is automatically set by Vercel to 'development', 'preview', or 'production'
  // For local development, VERCEL_ENV won't be set, so we fall back to NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV as 'development' | 'preview' | 'production' | undefined
  const nodeEnv = process.env.NODE_ENV
  
  if (vercelEnv) {
    return vercelEnv
  }
  
  // Local fallback
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
  // Include test vendors in development and preview environment
  return isDevOrPreview()
}

export const isTestVendor = (vendorId: string): boolean => {
  return vendorId.startsWith('TEST-')
}

export const shouldEnableAnalytics = () => {
  const env = getEnvironment()
  
  // Check for explicit overrides first
  if (process.env.FORCE_ENABLE_ANALYTICS === 'true') {
    return true
  }
  
  if (process.env.FORCE_DISABLE_ANALYTICS === 'true') {
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