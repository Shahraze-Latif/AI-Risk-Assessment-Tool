import Link from 'next/link';
import { Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">AI Risk Assessment Tool</span>
        </Link>
      </div>
    </header>
  );
}
