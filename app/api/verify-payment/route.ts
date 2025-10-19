import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🔍 Verifying payment for session:', sessionId);

    // First, check if the readiness check exists at all
    const { data: allChecks, error: allError } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('stripe_session_id', sessionId);

    console.log('📊 All readiness checks with this session ID:', allChecks);
    console.log('❌ Error fetching all checks:', allError);

    // Check if the readiness check exists and is paid
    const { data: readinessCheck, error } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('status', 'paid')
      .single();

    console.log('✅ Paid readiness check found:', readinessCheck);
    console.log('❌ Error fetching paid check:', error);

    if (error || !readinessCheck) {
      // Check if there's a record with this session ID but not paid
      const { data: pendingCheck } = await supabase
        .from('readiness_checks')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (pendingCheck) {
        console.log('⏳ Found pending check:', pendingCheck);
        return NextResponse.json({ 
          error: 'Payment is still processing. Please wait a moment and refresh the page.',
          status: 'pending',
          readinessCheck: pendingCheck
        }, { status: 202 });
      }

      return NextResponse.json({ error: 'Payment not found or not verified' }, { status: 404 });
    }

    return NextResponse.json({ verified: true, readinessCheck });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}

