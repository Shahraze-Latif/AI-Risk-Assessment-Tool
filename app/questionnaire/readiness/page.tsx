'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Loader2, Shield, Database, Users, Eye, FileText, ChevronRight } from 'lucide-react';
import { animations } from '@/lib/animations';
import { generateClientPDF, formatReportData } from '@/lib/clientPdfGenerator';

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
        text: 'Do you have clearly defined roles and ownership for AI systems?',
        options: [
          { value: 0, label: 'Yes', description: 'Clear roles and ownership defined' },
          { value: 2, label: 'Partial', description: 'Some roles defined, gaps exist' },
          { value: 3, label: 'No', description: 'No clear roles or ownership' }
        ]
      },
      {
        id: 'policies',
        text: 'Do you have AI governance policies in place?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive policies implemented' },
          { value: 2, label: 'Partial/Draft', description: 'Policies in draft or partially implemented' },
          { value: 3, label: 'No', description: 'No AI governance policies' }
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
        text: 'What type of sensitive data does your AI system process?',
        options: [
          { value: 0, label: 'No', description: 'No sensitive data processed' },
          { value: 1, label: 'PII only', description: 'Only personally identifiable information' },
          { value: 3, label: 'PHI/Special', description: 'Protected health information or special categories' }
        ]
      },
      {
        id: 'data_geography',
        text: 'Do you know where your data is stored and processed geographically?',
        options: [
          { value: 0, label: 'No', description: 'No data storage concerns' },
          { value: 2, label: 'Unsure', description: 'Uncertain about data geography' },
          { value: 3, label: 'Yes', description: 'Data stored in multiple jurisdictions' }
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
        text: 'Do you have access controls for AI systems?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive access controls implemented' },
          { value: 2, label: 'Partial', description: 'Some access controls in place' },
          { value: 3, label: 'No', description: 'No access controls for AI systems' }
        ]
      },
      {
        id: 'protection_logs',
        text: 'Do you have data protection and audit logging?',
        options: [
          { value: 0, label: 'Yes', description: 'Full protection and logging implemented' },
          { value: 2, label: 'Partial', description: 'Some protection and logging measures' },
          { value: 3, label: 'No', description: 'No data protection or audit logging' }
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
        text: 'What AI providers do you use?',
        options: [
          { value: 1, label: 'OpenAI via Azure', description: 'Using OpenAI through Azure' },
          { value: 2, label: 'OSS/Multiple', description: 'Open source or multiple providers' },
          { value: 3, label: 'Unknown', description: 'Unclear or unknown providers' }
        ]
      },
      {
        id: 'contracts',
        text: 'Do you have data processing agreements with AI providers?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive DPAs in place' },
          { value: 2, label: 'Partial', description: 'Some DPAs or incomplete agreements' },
          { value: 3, label: 'No', description: 'No data processing agreements' }
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
        text: 'What level of human oversight do you have?',
        options: [
          { value: 0, label: 'Pre-deployment/Real-time', description: 'Human review before deployment and real-time monitoring' },
          { value: 2, label: 'Post-hoc', description: 'Human review after AI decisions' },
          { value: 3, label: 'None', description: 'No human oversight of AI systems' }
        ]
      },
      {
        id: 'rollback_incidents',
        text: 'Do you have rollback and incident response procedures?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive rollback and incident procedures' },
          { value: 2, label: 'Partial', description: 'Some procedures in place' },
          { value: 3, label: 'No', description: 'No rollback or incident procedures' }
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
        text: 'Do you disclose AI use to users?',
        options: [
          { value: 0, label: 'Yes', description: 'Clear disclosure of AI use to users' },
          { value: 2, label: 'Partial', description: 'Some disclosure but incomplete' },
          { value: 3, label: 'No', description: 'No disclosure of AI use to users' }
        ]
      },
      {
        id: 'record_keeping',
        text: 'Do you maintain records of AI system decisions?',
        options: [
          { value: 0, label: 'Yes', description: 'Comprehensive record keeping of AI decisions' },
          { value: 2, label: 'Partial', description: 'Some record keeping in place' },
          { value: 3, label: 'No', description: 'No record keeping of AI decisions' }
        ]
      }
    ]
  }
];

export default function ReadinessQuestionnairePage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'verified' | 'failed' | 'pending'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setPaymentStatus('failed');
      return;
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        console.log('🔍 Verifying payment for session:', sessionId);
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        
        if (response.ok) {
          console.log('✅ Payment verified successfully');
          setPaymentStatus('verified');
        } else if (response.status === 202) {
          // Payment is still processing
          console.log('⏳ Payment still processing, retrying...');
          setPaymentStatus('pending');
          // Retry after 3 seconds
          setTimeout(() => {
            verifyPayment();
          }, 3000);
        } else {
          const errorData = await response.json();
          console.error('❌ Payment verification failed:', errorData);
          setError(errorData.error || 'Payment verification failed');
          setPaymentStatus('failed');
        }
      } catch (err) {
        console.error('❌ Error verifying payment:', err);
        setError('Failed to verify payment');
        setPaymentStatus('failed');
      }
    };

    // Add a small delay to prevent flash of free questionnaire
    const timeoutId = setTimeout(() => {
      verifyPayment();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [sessionId]);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getProgress = () => {
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First, submit the assessment
      const assessmentResponse = await fetch('/api/readiness-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeSessionId: sessionId,
          answers: answers
        }),
      });

      if (!assessmentResponse.ok) {
        throw new Error('Failed to submit assessment');
      }

      const assessmentData = await assessmentResponse.json();
      
      // Generate PDF directly in the browser
      console.log('📄 Generating PDF report...');
      const reportData = formatReportData(
        assessmentData.result,
        assessmentData.clientName || 'Client'
      );
      
      await generateClientPDF(
        reportData,
        `Client_ReadinessCheck_${new Date().toISOString().split('T')[0]}.pdf`
      );
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllAnswered = () => {
    const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
    return Object.keys(answers).length === totalQuestions;
  };

  if (paymentStatus === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Processing Payment</h1>
            <p className="text-lg text-gray-700">Please wait while we verify your payment...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
            <p className="text-lg text-gray-700">Your payment is being processed. Please wait a moment...</p>
            <p className="text-sm text-gray-500">This page will automatically refresh when payment is confirmed.</p>
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
                Complete the assessment to receive your personalized risk analysis and 30-day action plan.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{Math.round(getProgress())}%</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              {categories.map((category, index) => (
                <Button
                  key={category.id}
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
              ))}
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
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
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
                    onClick={handleSubmit}
                    disabled={!isAllAnswered() || isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Assessment'
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
                  <span className="text-green-800 font-medium">All questions answered! You can now submit your assessment.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

