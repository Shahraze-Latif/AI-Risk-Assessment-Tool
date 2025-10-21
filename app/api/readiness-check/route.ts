import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { processReadinessAssessment, validateAnswers } from '@/lib/readinessScoring';

interface ReadinessCheckRequest {
  paymentIntentId: string;
  readinessCheckId: string;
  answers: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReadinessCheckRequest = await request.json();
    const { paymentIntentId, readinessCheckId, answers } = body;

    if (!paymentIntentId || !readinessCheckId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that all questions are answered
    if (!validateAnswers(answers)) {
      return NextResponse.json({ error: 'All questions must be answered' }, { status: 400 });
    }

    // Verify the readiness check exists and is paid
    const { data: readinessCheck, error: fetchError } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('id', readinessCheckId)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('status', 'paid')
      .single();

    if (fetchError || !readinessCheck) {
      return NextResponse.json({ error: 'Invalid or unpaid payment' }, { status: 400 });
    }

    // Process the readiness assessment using the scoring utility
    const result = processReadinessAssessment(answers);

    // Save to Supabase
    const { error: updateError } = await supabase
      .from('readiness_checks')
      .update({
        status: 'processing',
        assessment_data: {
          answers,
          area_scores: result.areaScores,
          weighted_score: result.weightedScore,
          overall_label: result.overallLabel,
          plan: result.plan,
          heatmap: result.heatmap
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', readinessCheck.id);

    if (updateError) {
      console.error('Error updating readiness check:', updateError);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result,
      readinessCheckId: readinessCheck.id,
      clientName: readinessCheck.client_name || 'Client',
      clientEmail: readinessCheck.client_email
    });

  } catch (error) {
    console.error('Error processing readiness check:', error);
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 });
  }
}
