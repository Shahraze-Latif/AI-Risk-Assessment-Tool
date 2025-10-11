'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface LazyLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

export function LazyLink({
  href,
  children,
  className,
  prefetch = true,
  replace = false,
  scroll = true
}: LazyLinkProps) {
  const router = useRouter();
  const [isPreloading, setIsPreloading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Preload the route when component mounts
  useEffect(() => {
    if (prefetch) {
      router.prefetch(href);
    }
  }, [href, router, prefetch]);

  const handleMouseEnter = useCallback(() => {
    if (!isPreloading && prefetch) {
      setIsPreloading(true);
      router.prefetch(href);
      setTimeout(() => setIsPreloading(false), 1000);
    }
  }, [href, router, prefetch, isPreloading]);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      // Additional prefetch for critical routes
      router.prefetch(href);
      
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Navigate with options
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  }, [href, router, replace, scroll, isNavigating]);

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
    >
      {isNavigating ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
