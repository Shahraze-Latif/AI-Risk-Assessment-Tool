'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaidQuestionCardProps {
  questionId: string;
  questionText: string;
  options: { value: number; label: string; description: string }[];
  answer: number | undefined;
  onAnswer: (value: number) => void;
}

export const PaidQuestionCard = memo(function PaidQuestionCard({ 
  questionId, 
  questionText, 
  options, 
  answer, 
  onAnswer 
}: PaidQuestionCardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">
          {questionText}
        </Label>
      </div>
      
      <RadioGroup
        value={answer?.toString() || ''}
        onValueChange={(value) => onAnswer(parseInt(value))}
        className="grid grid-cols-1 gap-4"
      >
        {options.map((option) => (
          <div key={option.value} className="relative">
            <RadioGroupItem 
              value={option.value.toString()} 
              id={`${questionId}-${option.value}`}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 radio-blue"
            />
            <Label 
              htmlFor={`${questionId}-${option.value}`} 
              className={`
                block w-full p-3 pl-10 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                ${answer === option.value 
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
  );
});
