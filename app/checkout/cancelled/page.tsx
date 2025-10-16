import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { animations } from '@/lib/animations';

export default function CheckoutCancelledPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center space-y-6 mb-8">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Payment Cancelled
              </h1>
              <p className="text-lg text-gray-700">
                Your payment was cancelled. No charges have been made.
              </p>
            </div>

            {/* Info Card */}
            <Card className={`border-2 border-red-200 shadow-lg ${animations.card.hover}`}>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  What happens next?
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>No payment was processed</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>You can try again anytime</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Your data is secure and private</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/checkout" className="flex-1">
                    <Button
                      size="lg"
                      className={`w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Try Again
                    </Button>
                  </Link>
                  
                  <Link href="/" className="flex-1">
                    <Button
                      size="lg"
                      variant="outline"
                      className={`w-full text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                Need help? Contact us if you experienced any issues during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

