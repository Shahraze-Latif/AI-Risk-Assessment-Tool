import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const readinessCheckId = session.metadata?.readiness_check_id;

      if (!readinessCheckId) {
        console.error('No readiness_check_id found in session metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Update the readiness check record
      const { error: updateError } = await supabase
        .from('readiness_checks')
        .update({
          status: 'paid',
          stripe_session_id: session.id,
          client_email: session.customer_email || session.customer_details?.email,
          client_name: session.customer_details?.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', readinessCheckId);

      if (updateError) {
        console.error('Error updating readiness check:', updateError);
        return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
      }

      console.log(`Successfully updated readiness check ${readinessCheckId} to paid status`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

