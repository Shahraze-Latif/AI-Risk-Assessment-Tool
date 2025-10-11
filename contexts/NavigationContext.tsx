'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationState {
  isNavigating: boolean;
  currentRoute: string;
  preloadedRoutes: string[];
}

interface NavigationContextType {
  state: NavigationState;
  navigateTo: (href: string, options?: NavigationOptions) => Promise<void>;
  preloadRoute: (href: string) => void;
  preloadMultipleRoutes: (routes: string[]) => void;
}

interface NavigationOptions {
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  delay?: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    currentRoute: '',
    preloadedRoutes: []
  });

  const preloadRoute = useCallback((href: string) => {
    if (!state.preloadedRoutes.includes(href)) {
      router.prefetch(href);
      setState(prev => ({
        ...prev,
        preloadedRoutes: [...prev.preloadedRoutes, href]
      }));
    }
  }, [router, state.preloadedRoutes]);

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

    if (state.isNavigating) return;

    setState(prev => ({ ...prev, isNavigating: true }));

    try {
      if (prefetch) {
        preloadRoute(href);
      }

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }

      setState(prev => ({ ...prev, currentRoute: href }));
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [router, state.isNavigating, preloadRoute]);

  const preloadMultipleRoutes = useCallback((routes: string[]) => {
    routes.forEach(route => preloadRoute(route));
  }, [preloadRoute]);

  const value: NavigationContextType = {
    state,
    navigateTo,
    preloadRoute,
    preloadMultipleRoutes
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
