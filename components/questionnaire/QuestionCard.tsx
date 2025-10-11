'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  answer: boolean | null;
  onAnswer: (answer: boolean) => void;
}

export const QuestionCard = memo(function QuestionCard({ questionNumber, questionText, answer, onAnswer }: QuestionCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              {questionNumber}
            </span>
            <p className="text-lg text-gray-900 flex-1">{questionText}</p>
          </div>

          <div className="flex space-x-3 pl-11">
            <Button
              variant={answer === true ? "default" : "outline"}
              className={`flex-1 ${answer === true ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={() => onAnswer(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Yes
            </Button>
            <Button
              variant={answer === false ? "default" : "outline"}
              className={`flex-1 ${answer === false ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={() => onAnswer(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              No
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
