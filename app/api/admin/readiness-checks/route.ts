import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Fetch all readiness checks ordered by creation date
    const { data: readinessChecks, error } = await supabase
      .from('readiness_checks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching readiness checks:', error);
      return NextResponse.json({ error: 'Failed to fetch readiness checks' }, { status: 500 });
    }

    return NextResponse.json(readinessChecks || []);
  } catch (error) {
    console.error('Error in admin readiness checks API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

