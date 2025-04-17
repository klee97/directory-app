'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function useScrollRestoration(enabled: boolean = true) {
  const pathname = usePathname();
  const scrollKey = `scroll-pos:${pathname}`;

  // Save scroll on unload or route change
  useEffect(() => {
    if (!enabled) return;

    const saveScroll = () => {
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', saveScroll);
    window.addEventListener('pagehide', saveScroll); // For Safari

    return () => {
      saveScroll();
      window.removeEventListener('beforeunload', saveScroll);
      window.removeEventListener('pagehide', saveScroll);
    };
  }, [scrollKey, enabled]);

  // Restore scroll on mount
  useEffect(() => {
    if (!enabled) return;

    const navType = performance.getEntriesByType('navigation')[0]?.entryType;
    if (navType === 'back_forward') {
      const saved = sessionStorage.getItem(scrollKey);
      if (saved) {
        window.scrollTo({ top: parseInt(saved), behavior: 'instant' as ScrollBehavior });
        sessionStorage.removeItem(scrollKey);
      }
    }
  }, [scrollKey, enabled]);
}