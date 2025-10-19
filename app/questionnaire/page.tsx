'use client';

import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { QuestionCard } from '@/components/questionnaire/QuestionCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { questions } from '@/lib/questions';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load free questionnaire components
const DynamicFreeQuestionCard = dynamic(() => import('@/components/questionnaire/QuestionCard').then(mod => ({ default: mod.QuestionCard })), {
  loading: () => (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 animate-pulse">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
          <div className="flex space-x-3 pl-11">
            <Button disabled className="flex-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yes
            </Button>
            <Button disabled className="flex-1">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false
});

export default function QuestionnairePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check for session_id and redirect to paid questionnaire if found
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      console.log('🔄 Redirecting to paid questionnaire with session:', sessionId);
      // Immediate redirect without showing any content
      router.replace(`/questionnaire/readiness?session_id=${sessionId}`);
      return;
    }
    setIsCheckingSession(false);
  }, [searchParams, router]);

  // Memoized calculations to prevent unnecessary re-renders
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [currentQuestionIndex]);
  const isFirstQuestion = useMemo(() => currentQuestionIndex === 0, [currentQuestionIndex]);
  const isLastQuestion = useMemo(() => currentQuestionIndex === questions.length - 1, [currentQuestionIndex]);
  const currentAnswer = useMemo(() => answers[currentQuestionIndex], [answers, currentQuestionIndex]);
  const answeredQuestions = useMemo(() => answers.filter(a => a !== null).length, [answers]);
  const progress = useMemo(() => (answeredQuestions / questions.length) * 100, [answeredQuestions, questions.length]);

  const handleAnswer = useCallback((answer: boolean) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const handleNext = useCallback(async () => {
    if (currentAnswer !== null && !isLastQuestion) {
      setIsNavigating(true);
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentQuestionIndex(prev => prev + 1);
      setIsNavigating(false);
    }
  }, [currentAnswer, isLastQuestion]);

  const handlePrevious = useCallback(async () => {
    if (!isFirstQuestion) {
      setIsNavigating(true);
      // Small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentQuestionIndex(prev => prev - 1);
      setIsNavigating(false);
    }
  }, [isFirstQuestion]);

  const handleSubmit = useCallback(async () => {
    const allAnswered = answers.every(a => a !== null);
    if (!allAnswered) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      router.push(`/results?id=${data.id}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  }, [answers, router]);

  const canProceed = useMemo(() => currentAnswer !== null, [currentAnswer]);
  const allAnswered = useMemo(() => answers.every(a => a !== null), [answers]);

  // Show loading while checking for session_id
  if (isCheckingSession) {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Show minimal loading for paid questionnaire redirect
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Redirecting to paid questionnaire...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Layout>
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Loading Questionnaire</h1>
            <p className="text-lg text-gray-700">Please wait while we prepare your assessment...</p>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Risk Assessment Questionnaire</h1>
            <p className="text-lg text-gray-600 mb-6">
              Please answer all questions honestly. Your responses will help us evaluate your AI risk exposure.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          <div className="mb-8">
            <div className={`transition-opacity duration-200 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
              <Suspense fallback={
                <Card className="w-full">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 animate-pulse">
                          <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex space-x-3 pl-11">
                        <Button disabled className="flex-1">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Yes
                        </Button>
                        <Button disabled className="flex-1">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          No
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }>
                <DynamicFreeQuestionCard
                  questionNumber={currentQuestion.id}
                  questionText={currentQuestion.text}
                  answer={currentAnswer}
                  onAnswer={handleAnswer}
                />
              </Suspense>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion || isNavigating}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {isLastQuestion ? (
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting || isNavigating}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Assessment'
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!canProceed || isNavigating}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </Layout>
    </div>
  );
}
