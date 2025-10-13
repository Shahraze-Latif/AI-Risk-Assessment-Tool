'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const isResultsPage = pathname === '/results';
  const isQuestionnairePage = pathname === '/questionnaire';

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
              className="h-6 sm:h-8 w-6 sm:w-8"
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">AI Risk Assessment Tool</span>
          </Link>
          
          {(isResultsPage || isQuestionnairePage) && (
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-50 text-xs sm:text-sm"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
