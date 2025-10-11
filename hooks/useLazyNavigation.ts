import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationOptions {
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  delay?: number;
}

export function useLazyNavigation() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());

  const preloadRoute = useCallback((href: string) => {
    if (!preloadedRoutes.has(href)) {
      router.prefetch(href);
      setPreloadedRoutes(prev => {
        const newSet = new Set(prev);
        newSet.add(href);
        return newSet;
      });
    }
  }, [router, preloadedRoutes]);

  const navigateTo = useCallback(async (
    href: string, 
    options: NavigationOptions = {}
  ) => {
    const {
      prefetch = true,
      replace = false,
      scroll = true,
      delay = 100
    } = options;

    if (isNavigating) return;

    setIsNavigating(true);

    try {
      // Prefetch if requested
      if (prefetch) {
        preloadRoute(href);
      }

      // Add delay for smooth transition
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Navigate with options
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [router, isNavigating, preloadRoute]);

  const preloadMultipleRoutes = useCallback((routes: string[]) => {
    routes.forEach(route => preloadRoute(route));
  }, [preloadRoute]);

  return {
    navigateTo,
    preloadRoute,
    preloadMultipleRoutes,
    isNavigating,
    preloadedRoutes: Array.from(preloadedRoutes.values())
  };
}
