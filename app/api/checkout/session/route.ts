import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const domainUrl = process.env.NEXT_PUBLIC_DOMAIN_URL || 'http://localhost:3000';

    // Create a new readiness check record in Supabase
    const { data: readinessCheck, error: insertError } = await supabase
      .from('readiness_checks')
      .insert({
        status: 'payment_pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating readiness check:', insertError);
      throw new Error('Failed to create readiness check record');
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Compliance Readiness Check',
              description: 'Comprehensive risk assessment with 30-day action plan and PDF report',
            },
            unit_amount: 20000, // $200.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${domainUrl}/questionnaire/readiness?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/checkout/cancelled`,
      metadata: {
        readiness_check_id: readinessCheck.id,
      },
      customer_email: undefined, // Let Stripe collect email
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

