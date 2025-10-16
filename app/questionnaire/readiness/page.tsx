'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { animations } from '@/lib/animations';
import Link from 'next/link';

export default function ReadinessQuestionnairePage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'verified' | 'failed'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setPaymentStatus('failed');
      return;
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (response.ok) {
          setPaymentStatus('verified');
        } else {
          setError('Payment verification failed');
          setPaymentStatus('failed');
        }
      } catch (err) {
        setError('Failed to verify payment');
        setPaymentStatus('failed');
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (paymentStatus === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <p className="text-lg text-gray-700">Verifying your payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-2xl mx-auto">
              <div className="text-center space-y-6 mb-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Payment Verification Failed
                </h1>
                <p className="text-lg text-gray-700">
                  {error || 'We could not verify your payment. Please contact support.'}
                </p>
              </div>

              <Card className={`border-2 border-red-200 shadow-lg ${animations.card.hover}`}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">
                      If you believe this is an error, please contact our support team.
                    </p>
                    <Link href="/">
                      <Button
                        size="lg"
                        className={`text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg ${animations.button.primary}`}
                      >
                        Return to Home
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center space-y-6 mb-8">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-700">
                Thank you for your purchase. You can now proceed with your AI Compliance Readiness Check.
              </p>
            </div>

            {/* Next Steps Card */}
            <Card className={`border-2 border-green-200 shadow-lg ${animations.card.hover}`}>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Next Steps
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">What happens next:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Complete the comprehensive readiness assessment</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Receive your personalized risk heatmap</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Get your prioritized 30-day action plan</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Download your client-ready PDF report</span>
                    </li>
                  </ul>
                </div>

                {/* Start Assessment Button */}
                <div className="text-center">
                  <Link href="/questionnaire">
                    <Button
                      size="lg"
                      className={`text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                    >
                      Start Your Assessment
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>⏱️ Assessment takes approximately 15-20 minutes</p>
                  <p>📧 Results will be delivered within 7 days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

