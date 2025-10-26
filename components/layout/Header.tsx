'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, FileText } from 'lucide-react';
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
              src="/logo-with-text.svg" 
              alt="AI Risk Assessment Tool" 
              width={48} 
              height={48}
              className="h-8 sm:h-10 w-8 sm:w-10"
            />
            <span className="text-sm sm:text-xl font-semibold text-gray-900">AI Risk Assessment Tool</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sample Report Button - Always visible */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-1 sm:space-x-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-xs sm:text-sm transition-all duration-200"
              onClick={() => {
                const sampleUrl = process.env.NEXT_PUBLIC_SAMPLE_REPORT_URL || 'https://drive.google.com/file/d/1G8iKfc05z5VDK0RxELbReyB8l6pD9uwq/view?usp=sharing';
                window.open(sampleUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sample Report</span>
              <span className="sm:hidden">Sample</span>
            </Button>
            
            {/* Return Home Button - Only on specific pages */}
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
      </div>
    </header>
  );
}
