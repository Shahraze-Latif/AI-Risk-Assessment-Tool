import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check if the readiness check exists and is paid
    const { data: readinessCheck, error } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('status', 'paid')
      .single();

    if (error || !readinessCheck) {
      return NextResponse.json({ error: 'Payment not found or not verified' }, { status: 404 });
    }

    return NextResponse.json({ verified: true, readinessCheck });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}

