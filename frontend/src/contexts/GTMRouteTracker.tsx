'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function GTMRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + '?' + searchParams.toString()

    window.dataLayer?.push({
      event: 'virtual_page_view',
      page_path: pathname,
      page_location: url,
    })
  }, [pathname, searchParams])

  return null
}
