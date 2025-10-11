// Common navigation routes for the application
export const ROUTES = {
  HOME: '/',
  QUESTIONNAIRE: '/questionnaire',
  RESULTS: '/results',
  HEALTH: '/api/health'
} as const;

// Routes that should be preloaded for better performance
export const CRITICAL_ROUTES = [
  ROUTES.QUESTIONNAIRE,
  ROUTES.RESULTS
] as const;

// Navigation configuration
export const NAVIGATION_CONFIG = {
  DEFAULT_DELAY: 100,
  PREFETCH_DELAY: 50,
  MAX_PRELOADED_ROUTES: 5
} as const;

// Navigation utility functions
export function isInternalRoute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

export function shouldPrefetchRoute(href: string): boolean {
  return isInternalRoute(href) && CRITICAL_ROUTES.includes(href as any);
}

export function getNavigationDelay(route: string): number {
  // Longer delay for more complex routes
  if (route === ROUTES.QUESTIONNAIRE) return 150;
  if (route === ROUTES.RESULTS) return 200;
  return NAVIGATION_CONFIG.DEFAULT_DELAY;
}
