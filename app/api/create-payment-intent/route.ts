import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating payment intent...');
    
    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found');
      return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
      console.error('❌ Supabase credentials not found');
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const { paymentMethodId, clientEmail, clientName } = await request.json();
    console.log('📝 Request data:', { paymentMethodId: paymentMethodId?.substring(0, 10) + '...', clientEmail, clientName });

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    // Create a new readiness check record in Supabase
    console.log('💾 Creating readiness check record...');
    const { data: readinessCheck, error: insertError } = await supabase
      .from('readiness_checks')
      .insert({
        status: 'payment_pending',
        client_email: clientEmail,
        client_name: clientName,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating readiness check:', insertError);
      return NextResponse.json({ error: 'Failed to create readiness check record' }, { status: 500 });
    }
    
    console.log('✅ Readiness check created:', readinessCheck.id);

    // Create and confirm PaymentIntent
    console.log('💳 Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 20000, // $200.00 in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_DOMAIN_URL || 'http://localhost:3000'}/questionnaire/readiness`,
      metadata: {
        readiness_check_id: readinessCheck.id,
        client_email: clientEmail || '',
        client_name: clientName || '',
      },
    });
    
    console.log('✅ Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);

    // Handle different payment statuses
    if (paymentIntent.status === 'succeeded') {
      // Update the readiness check record to paid status
      const { error: updateError } = await supabase
        .from('readiness_checks')
        .update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', readinessCheck.id);

      if (updateError) {
        console.error('Error updating readiness check:', updateError);
        return NextResponse.json({ error: 'Payment succeeded but failed to update record' }, { status: 500 });
      }

      return NextResponse.json({ 
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
        readinessCheckId: readinessCheck.id
      });
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({ 
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        readinessCheckId: readinessCheck.id
      });
    } else {
      return NextResponse.json({ 
        status: paymentIntent.status,
        error: 'Payment failed',
        paymentIntentId: paymentIntent.id,
        readinessCheckId: readinessCheck.id
      });
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
