'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const isResultsPage = pathname === '/results';

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.svg" 
              alt="AI Risk Assessment Tool" 
              width={32} 
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-900">AI Risk Assessment Tool</span>
          </Link>
          
          {isResultsPage && (
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
