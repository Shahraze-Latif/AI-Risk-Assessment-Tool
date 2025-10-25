'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Loader2, Shield, Database, Users, Eye, FileText, ChevronRight, CreditCard, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import { animations } from '@/lib/animations';
// PDF generation removed - now using Google Sheets
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';


interface Question {
  id: string;
  text: string;
  options: { value: number; label: string; description: string }[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  questions: Question[];
}

const categories: Category[] = [
  {
    id: 'governance',
    name: 'Governance',
    icon: <Shield className="h-6 w-6" />,
    questions: [
      {
        id: 'roles_ownership',
        text: 'Do you have named owners for AI risk (product, data, security, legal)?',
        options: [
          { value: 0, label: 'Yes', description: 'Named owners for AI risk defined' },
          { value: 2, label: 'Partial', description: 'Some owners defined, gaps exist' },
          { value: 3, label: 'No', description: 'No named owners for AI risk' }
        ]
      },
      {
        id: 'policies',
        text: 'Do you have any written AI or model governance policy?',
        options: [
          { value: 0, label: 'Yes', description: 'Written AI governance policy in place' },
          { value: 2, label: 'Partial', description: 'Partial policy or draft version' },
          { value: 2.1, label: 'Draft', description: 'Policy in draft form' },
          { value: 3, label: 'No', description: 'No written AI governance policy' }
        ]
      }
    ]
  },
  {
    id: 'data',
    name: 'Data',
    icon: <Database className="h-6 w-6" />,
    questions: [
      {
        id: 'sensitive_data',
        text: 'Does the system use PII/PHI or similarly sensitive data?',
        options: [
          { value: 0, label: 'No', description: 'No sensitive data used' },
          { value: 1, label: 'PII only', description: 'Only personally identifiable information' },
          { value: 3, label: 'PHI or special categories', description: 'Protected health information or special categories' }
        ]
      },
      {
        id: 'data_geography',
        text: 'Are end users or data subjects in the EU/UK?',
        options: [
          { value: 0, label: 'No', description: 'No EU/UK end users or data subjects' },
          { value: 2, label: 'Unsure', description: 'Uncertain about EU/UK presence' },
          { value: 3, label: 'Yes', description: 'End users or data subjects in EU/UK' }
        ]
      }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: <Shield className="h-6 w-6" />,
    questions: [
      {
        id: 'access_controls',
        text: 'Are MFA and role-based access (RBAC) enabled for all admin paths?',
        options: [
          { value: 0, label: 'Yes', description: 'MFA and RBAC enabled for all admin paths' },
          { value: 2, label: 'Partial', description: 'Some MFA and RBAC implemented' },
          { value: 3, label: 'No', description: 'No MFA or RBAC for admin paths' }
        ]
      },
      {
        id: 'protection_logs',
        text: 'Is data encrypted at rest/in transit and are access/inference logs retained?',
        options: [
          { value: 0, label: 'Yes', description: 'Full encryption and logging implemented' },
          { value: 2, label: 'Partial', description: 'Some encryption and logging measures' },
          { value: 3, label: 'No', description: 'No encryption or logging' }
        ]
      }
    ]
  },
  {
    id: 'vendors',
    name: 'Vendors',
    icon: <Users className="h-6 w-6" />,
    questions: [
      {
        id: 'providers',
        text: 'Which AI providers are used?',
        options: [
          { value: 1, label: 'OpenAI via Azure', description: 'Using OpenAI through Azure' },
          { value: 1.1, label: 'Other US', description: 'Other US-based providers' },
          { value: 2, label: 'OSS', description: 'Open source solutions' },
          { value: 2.1, label: 'Multiple', description: 'Multiple providers' }
        ]
      },
      {
        id: 'contracts',
        text: 'Do you have DPAs and security terms with AI vendors?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive DPAs and security terms' },
          { value: 2, label: 'Partial', description: 'Some DPAs or incomplete agreements' },
          { value: 3, label: 'No', description: 'No DPAs or security terms' }
        ]
      }
    ]
  },
  {
    id: 'human_oversight',
    name: 'Human Oversight',
    icon: <Eye className="h-6 w-6" />,
    questions: [
      {
        id: 'human_in_loop',
        text: 'Where is human review applied?',
        options: [
          { value: 0, label: 'Pre-deployment', description: 'Human review before deployment' },
          { value: 0.1, label: 'Real-time', description: 'Real-time human review' },
          { value: 2, label: 'Post-hoc', description: 'Human review after decisions' },
          { value: 3, label: 'None', description: 'No human review applied' }
        ]
      },
      {
        id: 'rollback_incidents',
        text: 'Is there a defined rollback + incident handling plan for AI features?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive rollback and incident plan' },
          { value: 2, label: 'Partial', description: 'Some rollback and incident procedures' },
          { value: 3, label: 'No', description: 'No rollback or incident plan' }
        ]
      }
    ]
  },
  {
    id: 'transparency',
    name: 'Transparency',
    icon: <FileText className="h-6 w-6" />,
    questions: [
      {
        id: 'user_disclosure',
        text: 'Are users informed when they interact with AI or when AI influences decisions?',
        options: [
          { value: 0, label: 'Yes', description: 'Users clearly informed about AI interaction' },
          { value: 2, label: 'Partial', description: 'Some disclosure but incomplete' },
          { value: 3, label: 'No', description: 'No disclosure of AI interaction' }
        ]
      },
      {
        id: 'record_keeping',
        text: 'Do you keep a model inventory + change log?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive model inventory and change log' },
          { value: 2, label: 'Partial', description: 'Some inventory and logging' },
          { value: 3, label: 'No', description: 'No model inventory or change log' }
        ]
      }
    ]
  }
];

export default function ReadinessQuestionnairePage() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const readinessCheckId = searchParams.get('readiness_check');
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'verified' | 'failed'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // New form fields
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCases, setUseCases] = useState('');
  const [dataCategories, setDataCategories] = useState('');
  const [modelType, setModelType] = useState('');
  const [clientName, setClientName] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  
  // Step-based flow
  const [currentStep, setCurrentStep] = useState<'company' | 'questions' | 'payment' | 'success'>('company');
  
  // Stripe payment state
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    // Start with company information step
    setPaymentStatus('verified');
  }, []);

  // Initialize Stripe when payment step is reached
  useEffect(() => {
    if (currentStep === 'payment' && !stripe) {
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
    }
  }, [currentStep, stripe]);

  const handleAnswerChange = (questionId: string, value: number) => {
    console.log('handleAnswerChange called:', { questionId, value, type: typeof value });
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const sendToGoogleSheets = async (assessmentData: any, answers: Record<string, number>) => {
    try {
      // Map questionnaire answers to form fields
      const formData = new FormData();
      
      // Use new form fields
      formData.append('Company', company || 'AI Risk Assessment Client');
      formData.append('Industry', industry || 'Technology');
      formData.append('UseCases', useCases || 'AI Compliance Assessment');
      formData.append('DataCategories', dataCategories || 'Assessment Data');
      formData.append('ModelType', modelType || 'AI Assessment Tool');
      
      // Map questionnaire answers to form fields
      formData.append('PHI', answers.sensitive_data === 3 ? 'Yes' : 'No');
      formData.append('EUUsers', answers.data_geography === 3 ? 'Yes' : 'No');
      formData.append('Vendors', getVendorType(answers.providers));
      
      // Map control answers
      formData.append('Controls_MFA', answers.access_controls <= 1 ? 'Yes' : 'No');
      formData.append('Controls_RBAC', answers.access_controls <= 1 ? 'Yes' : 'No');
      formData.append('Controls_Encryption', answers.protection_logs <= 1 ? 'Yes' : 'No');
      formData.append('Controls_Logging', answers.protection_logs <= 1 ? 'Yes' : 'No');
      
      // Map oversight level
      formData.append('OversightLevel', getOversightLevel(answers.human_in_loop));
      formData.append('Links', 'Assessment completed via AI Risk Assessment Tool');
      
      // Add client info
      formData.append('ClientName', clientName || 'Client');
      formData.append('ClientEmail', assessmentData.clientEmail || '');
      
      // Send to Google Apps Script
      const payload = new URLSearchParams();
      payload.append('Company', company || 'AI Risk Assessment Client');
      payload.append('Industry', industry || 'Technology');
      payload.append('UseCases', useCases || 'AI Compliance Assessment');
      payload.append('DataCategories', dataCategories || 'Assessment Data');
      payload.append('ModelType', modelType || 'AI Assessment Tool');
      payload.append('PHI', answers.sensitive_data === 3 ? 'Yes' : 'No');
      payload.append('EUUsers', answers.data_geography === 3 ? 'Yes' : 'No');
      payload.append('Vendors', getVendorType(answers.providers));
      payload.append('Controls_MFA', answers.access_controls <= 1 ? 'Yes' : 'No');
      payload.append('Controls_RBAC', answers.access_controls <= 1 ? 'Yes' : 'No');
      payload.append('Controls_Encryption', answers.protection_logs <= 1 ? 'Yes' : 'No');
      payload.append('Controls_Logging', answers.protection_logs <= 1 ? 'Yes' : 'No');
      payload.append('OversightLevel', getOversightLevel(answers.human_in_loop)); // ✅ critical
      payload.append('Links', 'Assessment completed via AI Risk Assessment Tool');
      payload.append('ClientName', clientName || 'Client');
      payload.append('ClientEmail', assessmentData.clientEmail || '');
      
      await fetch('https://script.google.com/macros/s/AKfycbwAGC5BGsMg04PxEE9uBPXFWwK8rAw5Z3oBvu-ahFcarZ5tOnGJ-ujmGsYjE0UOKVIxgA/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });
      
      
      console.log('✅ Data sent to Google Sheets');
      
      // Generate a unique submission ID for this assessment
      const submissionId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return submissionId;
    } catch (error) {
      console.error('❌ Error sending to Google Sheets:', error);
      // Don't throw error - let the user know it was submitted but sheets failed
      alert('Assessment completed, but there was an issue saving to our records. Please contact support.');
      // Return a fallback submission ID
      return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  const getVendorType = (providerValue: number) => {
    if (providerValue === 1) return 'OpenAI via Azure';
    if (providerValue === 1.1) return 'Other US-based';
    if (providerValue === 2) return 'Open Source';
    if (providerValue === 2.1) return 'Multiple providers';
    return 'Unknown';
  };

  const getOversightLevel = (oversightValue: number) => {
    if (oversightValue === 0) return 'Pre-deployment';
    if (oversightValue === 0.1) return 'Real-time';
    if (oversightValue === 2) return 'Post-hoc';
    if (oversightValue === 3) return 'None';
    return 'Unknown';
  };

  const getProgress = () => {
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const handleCompanySubmit = () => {
    if (isFormComplete()) {
      setCurrentStep('questions');
    } else {
      toast({
        title: "Incomplete Information",
        description: 'Please fill in all company information fields.',
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleQuestionsSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Send data to Google Sheets first
      console.log('📊 Sending data to Google Sheets...');
      const submissionId = await sendToGoogleSheets({}, answers);
      
      // Store submission ID for later use in email trigger
      sessionStorage.setItem('assessmentSubmissionId', submissionId);
      
      // Move to payment step
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Submission Error",
        description: 'Failed to submit assessment. Please try again.',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllAnswered = () => {
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    return Object.keys(answers).length === totalQuestions;
  };

  const isFormComplete = () => {
    return company && industry && useCases && dataCategories && modelType && clientName;
  };

  const handlePayment = async () => {
    if (!stripe || !cardElement) {
      toast({
        title: "Payment Error",
        description: 'Stripe is not loaded. Please refresh the page.',
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
  
    setIsPaymentLoading(true);
    setPaymentError(null);
  
    try {
      // 🧾 Retrieve submissionId from sessionStorage (saved after form submit)
      const submissionId = sessionStorage.getItem('assessmentSubmissionId');
  
      if (!submissionId) {
        console.error('❌ Missing submissionId — form may not have been submitted correctly.');
        toast({
          title: "Missing submission ID",
          description: "We couldn’t find your submission. Please resubmit the form.",
          variant: "destructive",
          duration: 6000,
        });
        setIsPaymentLoading(false);
        return;
      }
  
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { email: clientEmail, name: clientName },
      });
  
      if (pmError) {
        setPaymentError(pmError.message);
        toast({
          title: "Payment Method Error",
          description: pmError.message,
          variant: "destructive",
          duration: 5000,
        });
        setIsPaymentLoading(false);
        return;
      }
  
      // Create and confirm payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          clientEmail,
          clientName,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Payment failed');
  
      const triggerEmail = async () => {
        try {
          const url =
            'https://script.google.com/macros/s/AKfycbwAGC5BGsMg04PxEE9uBPXFWwK8rAw5Z3oBvu-ahFcarZ5tOnGJ-ujmGsYjE0UOKVIxgA/exec' +
            '?action=sendReportEmail' +
            `&submissionId=${encodeURIComponent(submissionId)}` + // ✅ include submissionId
            `&clientEmail=${encodeURIComponent(clientEmail)}` +
            `&clientName=${encodeURIComponent(clientName)}`;
  
          const res = await fetch(url);
          const text = await res.text();
          console.log('✅ Email trigger response:', text);
        } catch (error) {
          console.error('❌ Error triggering email:', error);
        }
      };
  
      if (result.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully. Your report will be sent to your email shortly.",
          duration: 5000,
        });
  
        await triggerEmail(); // ✅ Run with submissionId
        setCurrentStep('success');
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
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully. Your report will be sent to your email shortly.",
            duration: 5000,
          });
  
          await triggerEmail(); // ✅ Run with submissionId
          setCurrentStep('success');
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
      setIsPaymentLoading(false);
    }
  };
  

  // Only show loading for initial verification, not for successful payment
  // if (paymentStatus === 'loading') {
  //   return (
  //     <Layout>
  //       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
  //         <div className="text-center space-y-6">
  //           <div className="relative">
  //             <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
  //             <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
  //           </div>
  //           <div className="space-y-2">
  //             <h1 className="text-3xl font-bold text-gray-900">Please Wait</h1>
  //             <p className="text-lg text-gray-700">Verifying your payment and preparing your assessment...</p>
  //             <p className="text-sm text-gray-500">Setting up your personalized AI Compliance Readiness Check</p>
  //           </div>
  //           <div className="flex items-center justify-center space-x-2 text-blue-600">
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  //           </div>
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }

  // if (paymentStatus === 'loading') {
  //   return (
  //     <Layout>
  //       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
  //         <div className="text-center space-y-6">
  //           <div className="relative">
  //             <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
  //             <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
  //           </div>
  //           <div className="space-y-2">
  //             <h1 className="text-3xl font-bold text-gray-900">Verifying Payment</h1>
  //             <p className="text-lg text-gray-700">Please wait while we verify your payment...</p>
  //             <p className="text-sm text-gray-500">This usually takes just a moment</p>
  //           </div>
  //           <div className="flex items-center justify-center space-x-2 text-blue-600">
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
  //             <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  //           </div>
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }

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
                    <Button
                      size="lg"
                      className={`text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg ${animations.button.primary}`}
                      onClick={() => window.location.href = '/'}
                    >
                      Return to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6 mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Assessment Complete!
                </h1>
                <p className="text-lg text-gray-700">
                  Your AI Compliance Readiness Check has been successfully completed and your personalized report has been generated.
                </p>
              </div>

              {/* What Happens Next Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className={`border-2 border-blue-200 shadow-lg ${animations.card.hover}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Your Report is Ready</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">PDF report has been automatically downloaded to your device</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Comprehensive risk assessment with detailed findings</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">30-day action plan with prioritized tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 border-green-200 shadow-lg ${animations.card.hover}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Next Steps</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Review your risk heatmap and identify priority areas</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Implement the 30-day action plan recommendations</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Address high-risk areas immediately for compliance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Contents */}
              <Card className={`border-2 border-indigo-200 shadow-lg mb-8 ${animations.card.hover}`}>
                <CardHeader>
                  <CardTitle className="text-center">Your Report Includes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center space-y-2">
                      <Database className="h-8 w-8 text-blue-600 mx-auto" />
                      <h4 className="font-semibold text-gray-900">Risk Heatmap</h4>
                      <p className="text-sm text-gray-600">Visual assessment of 6 key compliance areas</p>
                    </div>
                    <div className="text-center space-y-2">
                      <Users className="h-8 w-8 text-green-600 mx-auto" />
                      <h4 className="font-semibold text-gray-900">Detailed Findings</h4>
                      <p className="text-sm text-gray-600">Comprehensive analysis with specific recommendations</p>
                    </div>
                    <div className="text-center space-y-2">
                      <Eye className="h-8 w-8 text-purple-600 mx-auto" />
                      <h4 className="font-semibold text-gray-900">30-Day Plan</h4>
                      <p className="text-sm text-gray-600">Prioritized action items with clear timelines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  className={`text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg ${animations.button.primary}`}
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
                <p className="text-sm text-gray-500">
                  Need help with your assessment? Contact our compliance experts for guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentCategoryData = categories[currentCategory];

  // Step 1: Company Information
  if (currentStep === 'company') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-6 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  AI Compliance Readiness Check
                </h1>
                <p className="text-lg text-gray-700">
                  Step 1: Tell us about your company to personalize your assessment.
                </p>
              </div>

              {/* Company Information Form */}
              <Card className={`border-2 border-blue-200 shadow-lg ${animations.card.hover}`}>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Company Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Please provide your company details to personalize your assessment.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Enter your company name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        type="text"
                        placeholder="e.g., Healthcare, Finance, Technology"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Your Full Name *</Label>
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
                    <Label htmlFor="useCases">AI Use Cases *</Label>
                    <Textarea
                      id="useCases"
                      placeholder="Describe your AI use cases and applications..."
                      value={useCases}
                      onChange={(e) => setUseCases(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataCategories">Data Categories *</Label>
                    <Textarea
                      id="dataCategories"
                      placeholder="Describe the types of data you process (PII, PHI, financial, etc.)..."
                      value={dataCategories}
                      onChange={(e) => setDataCategories(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modelType">AI Model Type *</Label>
                    <Input
                      id="modelType"
                      type="text"
                      placeholder="e.g., LLM, Computer Vision, NLP, Custom Models"
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    onClick={handleCompanySubmit}
                    disabled={!isFormComplete()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg"
                  >
                    Continue to Assessment Questions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Step 2: Assessment Questions
  if (currentStep === 'questions') {
    return (
      <Layout>
        <style jsx global>{`
          input[type="radio"]:checked {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
          }
          input[type="radio"]:checked::before {
            background-color: white !important;
          }
          input[type="radio"]:checked::after {
            background-color: white !important;
          }
          .radio-blue:checked {
            background-color: #2563eb !important;
            border-color: #2563eb !important;
          }
        `}</style>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-6 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  AI Compliance Readiness Check
                </h1>
                <p className="text-lg text-gray-700">
                  Step 2: Complete the assessment to receive your personalized risk analysis and 30-day action plan.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(getProgress())}%</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </div>

              {/* Category Navigation */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <TooltipProvider>
                  {categories.map((category, index) => (
                    <Tooltip key={category.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={currentCategory === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentCategory(index)}
                          className={`
                            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-1 min-w-0
                            ${currentCategory === index 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                              : 'bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400'
                            }
                          `}
                        >
                          {category.icon}
                          <span className="truncate">{category.name}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{category.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>

              {/* Current Category Questions */}
              <Card className={`border-2 shadow-lg ${animations.card.hover}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    {currentCategoryData.icon}
                    <span>{currentCategoryData.name}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {currentCategoryData.questions.map((question, questionIndex) => (
                    <div key={question.id} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {questionIndex + 1}. {question.text}
                        </Label>
                      </div>
                      
                      <RadioGroup
                        value={answers[question.id]?.toString() || ''}
                        onValueChange={(value) => {
                          console.log('Selected value:', value, 'for question:', question.id);
                          const numericValue = parseFloat(value);
                          console.log('Parsed numeric value:', numericValue);
                          handleAnswerChange(question.id, numericValue);
                        }}
                        className="grid grid-cols-1 gap-4"
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem 
                              value={option.value.toString()} 
                              id={`${question.id}-${option.value}`}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 radio-blue"
                            />
                            <Label 
                              htmlFor={`${question.id}-${option.value}`} 
                              className={`
                                block w-full p-3 pl-10 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                                ${answers[question.id] === option.value 
                                  ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-200' 
                                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                                }
                              `}
                            >
                              <div className="text-left space-y-1">
                                <div className="font-medium text-sm text-gray-900">{option.label}</div>
                                <div className="text-xs text-gray-600 leading-relaxed">{option.description}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Navigation and Submit */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
                  disabled={currentCategory === 0}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-4">
                  {currentCategory < categories.length - 1 ? (
                    <Button
                      onClick={() => setCurrentCategory(currentCategory + 1)}
                      disabled={currentCategory === categories.length - 1}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleQuestionsSubmit}
                      disabled={!isAllAnswered() || isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        'Complete Assessment & Proceed to Payment'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Completion Status */}
              {isAllAnswered() && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">All questions answered! You can now proceed to payment.</span>
                  </div>
                </div>
              )}
              
              {/* Form Incomplete Warning */}
              {!isAllAnswered() && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">Please answer all assessment questions to proceed.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Step 3: Payment
  if (currentStep === 'payment') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center space-y-6 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  You're Just One Click Away! 🎉
                </h1>
                <p className="text-lg text-gray-700">
                  Step 3: Your assessment has been saved successfully. Complete your payment to receive your personalized AI compliance report.
                </p>
                <div className="flex items-center justify-center space-x-2 text-3xl font-bold text-green-600 mt-4">
                  <span>$200</span>
                </div>
              </div>

              {/* Payment Form */}
              <Card className={`border-2 border-green-200 shadow-lg ${animations.card.hover}`}>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-blue-800">Name:</span>
                        <span className="text-sm text-blue-700">{clientName}</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-email">Email Address *</Label>
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
                    onClick={handlePayment}
                    disabled={isPaymentLoading || !clientName || !clientEmail || !stripe}
                    size="lg"
                    className={`w-full text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                  >
                    {isPaymentLoading ? (
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

                  <div className="text-center text-sm text-gray-500">
                    <p>🔒 Your payment information is secure and encrypted</p>
                    <p>📧 Your personalized report will be sent to your email immediately after payment</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Step 4: Success
  if (currentStep === 'success') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6 mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Assessment Complete!
                </h1>
                <p className="text-lg text-gray-700">
                  Your AI Compliance Readiness Check has been successfully completed and your personalized report has been generated.
                </p>
              </div>

              {/* What Happens Next Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className={`border-2 border-blue-200 shadow-lg ${animations.card.hover}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Your Report is Ready</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">PDF report has been sent to your email</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Comprehensive risk assessment with detailed findings</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">30-day action plan with prioritized tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 border-green-200 shadow-lg ${animations.card.hover}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span>Next Steps</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Review your risk heatmap and identify priority areas</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Implement the 30-day action plan recommendations</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-sm text-gray-700">Address high-risk areas immediately for compliance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  className={`text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg ${animations.button.primary}`}
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
                <p className="text-sm text-gray-500">
                  Need help with your assessment? Contact our compliance experts for guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Default fallback
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    </Layout>
  );
}

