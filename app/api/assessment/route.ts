import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { calculateRisk } from '@/lib/scoring';
import { questions } from '@/lib/questions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    if (answers.length !== questions.length) {
      return NextResponse.json(
        { error: `Expected ${questions.length} answers` },
        { status: 400 }
      );
    }

    const yesCount = answers.filter(a => a === true).length;
    const totalQuestions = answers.length;
    const riskLevel = calculateRisk(answers);

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        answers,
        yes_count: yesCount,
        total_questions: totalQuestions,
        risk_level: riskLevel
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      risk_level: data.risk_level,
      yes_count: data.yes_count,
      total_questions: data.total_questions
    });

  } catch (error) {
    console.error('Error processing assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
