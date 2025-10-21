import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');
    const readinessCheckId = searchParams.get('readiness_check');

    if (!paymentIntentId || !readinessCheckId) {
      return NextResponse.json({ error: 'Payment intent ID and readiness check ID are required' }, { status: 400 });
    }

    console.log('🔍 Verifying payment for intent:', paymentIntentId);

    // Check if the readiness check exists and is paid
    const { data: readinessCheck, error } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('id', readinessCheckId)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .eq('status', 'paid')
      .single();

    console.log('✅ Paid readiness check found:', readinessCheck);
    console.log('❌ Error fetching paid check:', error);

    if (error || !readinessCheck) {
      return NextResponse.json({ error: 'Payment not found or not verified' }, { status: 404 });
    }

    return NextResponse.json({ verified: true, readinessCheck });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}

