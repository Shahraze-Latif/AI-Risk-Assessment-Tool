'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LazyNavigationProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function LazyNavigation({
  href,
  children,
  className,
  size = 'default',
  variant = 'default',
  disabled = false
}: LazyNavigationProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = useCallback(() => {
    if (disabled || isNavigating) return;

    setIsNavigating(true);
    
    // Prefetch the route for faster navigation
    router.prefetch(href);
    
    // Navigate immediately
    router.push(href);
    
    // Reset state after navigation starts
    setTimeout(() => {
      setIsNavigating(false);
    }, 200);
  }, [href, router, disabled, isNavigating]);

  return (
    <Button
      onClick={handleNavigation}
      disabled={disabled || isNavigating}
      size={size}
      variant={variant}
      className={className}
    >
      {isNavigating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
