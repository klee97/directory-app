/**
 * Environment detection utilities for Vercel and local development
 */

export const getEnvironment = () => {
  // VERCEL_ENV is automatically set by Vercel to 'development', 'preview', or 'production'
  // For local development, VERCEL_ENV won't be set, so we fall back to NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV
  const nodeEnv = process.env.NODE_ENV
  
  if (vercelEnv) {
    return vercelEnv // 'development', 'preview', or 'production'
  }
  
  // Local fallback
  return nodeEnv === 'development' ? 'development' : 'production'
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
  if (typeof window === 'undefined') {
    // Server-side logging
    console.log('Environment Info:', {
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV,
      detected: getEnvironment(),
      isDevelopment: isDevelopment(),
      isPreview: isPreview(),
      isProduction: isProduction(),
      shouldIncludeFuturePosts: shouldIncludeFuturePosts(),
      shouldEnableAnalytics: shouldEnableAnalytics(),
    })
  }
}