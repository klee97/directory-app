'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { GoogleTagManager } from '@next/third-parties/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { getAnalyticsConfig, getEnvironment, isDevOrPreview } from '@/lib/env/env'

interface ConditionalAnalyticsProps {
  gtmId?: string
}

interface ConditionalGAProps {
  gaId?: string
}

interface ConditionalClarityProps {
  clarityId?: string
}

const ConditionalGTM: React.FC<ConditionalAnalyticsProps> = ({ gtmId }) => {
  const analyticsConfig = getAnalyticsConfig()
  
  if (!analyticsConfig.enabled || !gtmId) {
    return null
  }
  
  return <GoogleTagManager gtmId={gtmId} />
}

const ConditionalGA: React.FC<ConditionalGAProps> = ({ gaId }) => {
  const analyticsConfig = getAnalyticsConfig()
  
  if (!analyticsConfig.enabled || !gaId) {
    return null
  }
  
  return <GoogleAnalytics gaId={gaId} />
}

const ConditionalClarity: React.FC<ConditionalClarityProps> = ({ clarityId }) => {
  const analyticsConfig = getAnalyticsConfig()
  const environment = getEnvironment()
  
  if (!analyticsConfig.enabled || !clarityId) {
    return null
  }
  
  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
        ${environment !== 'production' ? `console.log('[${environment.toUpperCase()}] Microsoft Clarity loaded');` : ''}`,
      }}
    />
  )
}

const ConditionalGTMNoScript: React.FC<ConditionalAnalyticsProps> = ({ gtmId }) => {
  const analyticsConfig = getAnalyticsConfig()
  
  if (!analyticsConfig.enabled || !gtmId) {
    return null
  }
  
  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0" 
        width="0" 
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  )
}

interface AnalyticsStatus {
  enabled: boolean
  environment: string
  gtm: boolean
  ga: boolean
  clarity: boolean
}

const AnalyticsLogger: React.FC = () => {
  const analyticsConfig = getAnalyticsConfig()
  const environment = getEnvironment()

  useEffect(() => {
    if (isDevOrPreview()) {
      const status: AnalyticsStatus = {
        enabled: analyticsConfig.enabled,
        environment,
        gtm: !!process.env.NEXT_PUBLIC_GTM_ID,
        ga: !!process.env.NEXT_PUBLIC_GA_ID,
        clarity: !!process.env.NEXT_PUBLIC_CLARITY_ID,
      }
      
      console.debug(`[${environment.toUpperCase()}] Analytics Status:`, status)
      
      if (!analyticsConfig.enabled) {
        console.debug(`[${environment.toUpperCase()}] To enable analytics testing, set FORCE_ENABLE_ANALYTICS=true`)
      }
    }
  }, [environment, analyticsConfig.enabled])

  return null
}

// Export individual components for use in layout
export { ConditionalGTM, ConditionalGA, ConditionalClarity, ConditionalGTMNoScript }

// Main Analytics component for backward compatibility
const Analytics: React.FC = () => {
  return <AnalyticsLogger />
}

export default Analytics