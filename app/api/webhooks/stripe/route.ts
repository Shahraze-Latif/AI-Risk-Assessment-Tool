import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('[Webhook] Received Stripe webhook event');

    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Webhook] Event verified:', event.type, event.id);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresAction(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      
      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('[Webhook] checkout.session.completed:', session.id);
  
  try {
    // Extract payment information
    const paymentData = {
      timestamp: new Date().toISOString(),
      email: session.customer_email || session.customer_details?.email || '',
      amount: session.amount_total / 100, // Convert from cents to dollars
      status: 'completed',
      session_id: session.id,
      payment_intent_id: session.payment_intent,
      currency: session.currency,
      client_name: session.customer_details?.name || '',
    };

    // Record payment in Google Sheets
    await recordPaymentInGoogleSheets(paymentData);

    // Update Supabase if we have a readiness check ID
    if (session.metadata?.readiness_check_id) {
      await updateReadinessCheckStatus(session.metadata.readiness_check_id, 'paid', session.payment_intent);
    }

    console.log('[Webhook] Successfully processed checkout.session.completed');
  } catch (error) {
    console.error('[Webhook] Error handling checkout.session.completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('[Webhook] payment_intent.succeeded:', paymentIntent.id);
  
  try {
    // Extract payment information
    const paymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100, // Convert from cents to dollars
      status: 'succeeded',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
    };

    // Record payment in Google Sheets
    await recordPaymentInGoogleSheets(paymentData);

    // Update Supabase if we have a readiness check ID
    if (paymentIntent.metadata?.readiness_check_id) {
      await updateReadinessCheckStatus(paymentIntent.metadata.readiness_check_id, 'paid', paymentIntent.id);
    }

    console.log('[Webhook] Successfully processed payment_intent.succeeded');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.succeeded:', error);
  }
}

async function handlePaymentIntentRequiresAction(paymentIntent: any) {
  console.log('[Webhook] payment_intent.requires_action:', paymentIntent.id);
  
  try {
    // Log the event
    const paymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'requires_action',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
    };

    // Record in Google Sheets
    await recordPaymentInGoogleSheets(paymentData);

    console.log('[Webhook] Successfully processed payment_intent.requires_action');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.requires_action:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('[Webhook] payment_intent.payment_failed:', paymentIntent.id);
  
  try {
    // Log the failed payment
    const paymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'failed',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
    };

    // Record in Google Sheets
    await recordPaymentInGoogleSheets(paymentData);

    // Update Supabase if we have a readiness check ID
    if (paymentIntent.metadata?.readiness_check_id) {
      await updateReadinessCheckStatus(paymentIntent.metadata.readiness_check_id, 'payment_failed', paymentIntent.id);
    }

    console.log('[Webhook] Successfully processed payment_intent.payment_failed');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.payment_failed:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: any) {
  console.log('[Webhook] payment_intent.canceled:', paymentIntent.id);
  
  try {
    // Log the canceled payment
    const paymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'canceled',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
    };

    // Record in Google Sheets
    await recordPaymentInGoogleSheets(paymentData);

    // Update Supabase if we have a readiness check ID
    if (paymentIntent.metadata?.readiness_check_id) {
      await updateReadinessCheckStatus(paymentIntent.metadata.readiness_check_id, 'payment_canceled', paymentIntent.id);
    }

    console.log('[Webhook] Successfully processed payment_intent.canceled');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.canceled:', error);
  }
}

async function recordPaymentInGoogleSheets(paymentData: any) {
  try {
    console.log('[Webhook] Recording payment in Google Sheets:', paymentData);

    // Create form data for Google Apps Script
    const formData = new URLSearchParams();
    formData.append('timestamp', paymentData.timestamp);
    formData.append('email', paymentData.email);
    formData.append('amount', paymentData.amount.toString());
    formData.append('status', paymentData.status);
    formData.append('session_id', paymentData.session_id);
    formData.append('payment_intent_id', paymentData.payment_intent_id);
    formData.append('currency', paymentData.currency);
    formData.append('client_name', paymentData.client_name);

    // Send to Google Apps Script for Payments tab
    const response = await fetch('https://script.google.com/macros/s/AKfycbwugSWL5Sh67KPMJjrGunkrm0xPSOpguijHqN6xWSrDmxoKK3yF8vdaSH3wL4gQcZLd/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    console.log('[Webhook] Payment data sent to Google Sheets');
  } catch (error) {
    console.error('[Webhook] Error recording payment in Google Sheets:', error);
    // Don't throw error - webhook should still return 200
  }
}

async function updateReadinessCheckStatus(readinessCheckId: string, status: string, paymentIntentId: string) {
  try {
    console.log('[Webhook] Updating readiness check status:', readinessCheckId, status);

    const { error } = await supabase
      .from('readiness_checks')
      .update({
        status: status,
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', readinessCheckId);

    if (error) {
      console.error('[Webhook] Error updating readiness check:', error);
    } else {
      console.log('[Webhook] Successfully updated readiness check status');
    }
  } catch (error) {
    console.error('[Webhook] Error updating readiness check:', error);
  }
}
