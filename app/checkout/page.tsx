'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { animations } from '@/lib/animations';

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to proceed to payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                AI Compliance Readiness Check
              </h1>
              <p className="text-lg text-gray-700">
                Get your comprehensive risk assessment and 30-day action plan
              </p>
            </div>

            {/* Payment Card */}
            <Card className={`border-2 border-blue-200 shadow-lg ${animations.card.hover}`}>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Complete Your Purchase
                </CardTitle>
                <div className="flex items-center justify-center space-x-2 text-3xl font-bold text-blue-600 mt-4">
                  <span>$200</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* What's Included */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">What's Included:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Comprehensive AI risk heatmap</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Prioritized 30-day action plan</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Client-ready PDF report</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">EU AI Act + US Healthcare compliance focus</span>
                    </li>
                  </ul>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Secure payment powered by Stripe
                  </span>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  size="lg"
                  className={`w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Proceed to Payment</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="text-center text-sm text-gray-500">
                  <p>🔒 Your payment information is secure and encrypted</p>
                  <p>✅ 30-day money-back guarantee</p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                After payment, you'll be redirected to complete your readiness assessment.
                Your results will be delivered within 7 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

