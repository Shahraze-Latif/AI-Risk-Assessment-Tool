'use client';

import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  useEffect(() => {
    // Redirect to questionnaire page immediately
    window.location.href = '/questionnaire/readiness';
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Redirecting...</h1>
          <p className="text-lg text-gray-700">Taking you to the assessment...</p>
        </div>
      </div>
    </Layout>
  );
}