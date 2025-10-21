'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { animations } from '@/lib/animations';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!STRIPE_PUBLISHABLE_KEY) {
        console.error('Stripe publishable key not found');
        return;
      }

      const stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);

      if (stripeInstance) {
        const elementsInstance = stripeInstance.elements();
        setElements(elementsInstance);

        const cardElementInstance = elementsInstance.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#374151',
              fontFamily: 'system-ui, sans-serif',
              '::placeholder': {
                color: '#9CA3AF',
              },
            },
            invalid: {
              color: '#EF4444',
            },
          },
        });

        // Wait for the DOM element to be available
        const cardElementDiv = document.getElementById('card-element');
        if (cardElementDiv) {
          cardElementInstance.mount('#card-element');
          setCardElement(cardElementInstance);
        } else {
          console.error('Card element div not found');
        }

        cardElementInstance.on('change', (event: any) => {
          if (event.error) {
            setPaymentError(event.error.message);
          } else {
            setPaymentError(null);
          }
        });
      }
    };

    initializeStripe();
  }, []);

  const handleProceedToPayment = async () => {
    if (!stripe || !cardElement) {
      alert('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: clientEmail,
          name: clientName,
        },
      });

      if (pmError) {
        setPaymentError(pmError.message);
        toast({
          title: "Payment Method Error",
          description: pmError.message,
          variant: "destructive",
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      // Create and confirm payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          clientEmail,
          clientName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      if (result.status === 'succeeded') {
        // Payment succeeded, show success toast and redirect
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully. Redirecting to assessment...",
          duration: 3000,
        });
        // Small delay to show toast before redirect
        setTimeout(() => {
          window.location.href = `/questionnaire/readiness?payment_intent=${result.paymentIntentId}&readiness_check=${result.readinessCheckId}`;
        }, 1000);
      } else if (result.status === 'requires_action') {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (confirmError) {
          setPaymentError(confirmError.message);
          toast({
            title: "Payment Failed",
            description: confirmError.message,
            variant: "destructive",
            duration: 5000,
          });
        } else {
          // Payment succeeded after 3D Secure
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully. Redirecting to assessment...",
            duration: 3000,
          });
          setTimeout(() => {
            window.location.href = `/questionnaire/readiness?payment_intent=${result.paymentIntentId}&readiness_check=${result.readinessCheckId}`;
          }, 1000);
        }
      } else {
        setPaymentError('Payment failed. Please try again.');
        toast({
          title: "Payment Failed",
          description: 'Payment failed. Please try again.',
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('Failed to process payment. Please try again.');
      toast({
        title: "Payment Error",
        description: 'Failed to process payment. Please try again.',
        variant: "destructive",
        duration: 5000,
      });
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

            {/* Payment Form Card */}
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
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Full Name</Label>
                      <Input
                        id="client-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email Address</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="Enter your email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="card-element">Card Details</Label>
                    <div 
                      id="card-element"
                      className="p-4 border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200"
                      style={{ minHeight: '48px' }}
                    />
                    {paymentError && (
                      <div className="text-red-600 text-sm mt-2">
                        {paymentError}
                      </div>
                    )}
                  </div>
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
                  disabled={isLoading || !clientName || !clientEmail || !stripe}
                  size="lg"
                  className={`w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Complete Payment - $200</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* What's Included Card */}
            <Card className={`border-2 border-green-200 shadow-lg mt-6 ${animations.card.hover}`}>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 text-center">
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span className="text-gray-700">Comprehensive AI risk heatmap</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span className="text-gray-700">Prioritized 30-day action plan</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span className="text-gray-700">Client-ready PDF report</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-semibold">•</span>
                    <span className="text-gray-700">EU AI Act + US Healthcare compliance focus</span>
                  </div>
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

