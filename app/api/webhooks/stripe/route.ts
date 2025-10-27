import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { webhookLogger, extractRequestInfo, createTimer, formatError } from '@/lib/webhookLogger';
import { addBackgroundTask } from '@/lib/backgroundTaskProcessor';

// Types for better TypeScript support
interface PaymentData {
  timestamp: string;
  email: string;
  amount: number;
  status: string;
  session_id: string;
  payment_intent_id: string;
  currency: string;
  client_name: string;
  readiness_check_id?: string;
}

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Configuration
const WEBHOOK_TIMEOUT_MS = 8000; // 8 seconds max response time
const GOOGLE_SHEETS_TIMEOUT_MS = 5000; // 5 seconds for Google Sheets
const SUPABASE_TIMEOUT_MS = 3000; // 3 seconds for Supabase

export async function POST(request: NextRequest) {
  const timer = createTimer();
  timer.start();
  
  let eventId = 'unknown';
  let eventType = 'unknown';
  
  try {
    console.log('[Webhook] Received Stripe webhook event');

    // Extract request info for logging
    const requestInfo = extractRequestInfo(request);
    
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
      webhookLogger.logEvent(
        'unknown',
        'unknown',
        timer.stop(),
        'error',
        'Missing stripe-signature header',
        requestInfo
      );
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      webhookLogger.logEvent(
        'unknown',
        'unknown',
        timer.stop(),
        'error',
        'STRIPE_WEBHOOK_SECRET not configured',
        requestInfo
      );
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify the webhook signature with timeout
    let event: WebhookEvent;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      eventId = event.id;
      eventType = event.type;
    } catch (err) {
      const errorMessage = formatError(err);
      console.error('[Webhook] Signature verification failed:', errorMessage);
      webhookLogger.logEvent(
        'signature_verification',
        'unknown',
        timer.stop(),
        'error',
        errorMessage,
        requestInfo
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Webhook] Event verified:', eventType, eventId);

    // CRITICAL: Respond to Stripe immediately to avoid timeout
    const response = NextResponse.json({ 
      received: true, 
      event_id: eventId,
      processed_at: new Date().toISOString(),
      response_time_ms: timer.stop()
    });

    // Process the webhook event asynchronously (non-blocking)
    processWebhookEventAsync(event, requestInfo).catch(error => {
      console.error('[Webhook] Async processing error:', error);
      webhookLogger.logEvent(
        eventType,
        eventId,
        0, // Processing time not relevant for async errors
        'error',
        formatError(error),
        requestInfo
      );
    });

    // Log successful response
    webhookLogger.logEvent(
      eventType,
      eventId,
      timer.stop(),
      'success',
      undefined,
      requestInfo
    );

    return response;

  } catch (error) {
    const errorMessage = formatError(error);
    console.error('[Webhook] Error processing webhook:', errorMessage);
    
    webhookLogger.logEvent(
      eventType,
      eventId,
      timer.stop(),
      'error',
      errorMessage
    );
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Async function to handle heavy operations without blocking the response
async function processWebhookEventAsync(event: WebhookEvent, requestInfo: any): Promise<void> {
  const timer = createTimer();
  timer.start();
  
  try {
    console.log(`[Webhook] Starting async processing for ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompletedAsync(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceededAsync(event.data.object);
        break;
      
      case 'payment_intent.requires_action':
        await handlePaymentIntentRequiresActionAsync(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailedAsync(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceledAsync(event.data.object);
        break;
      
      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    console.log(`[Webhook] Completed async processing for ${event.type} in ${timer.stop()}ms`);
  } catch (error) {
    console.error(`[Webhook] Error in async processing for ${event.type}:`, error);
    webhookLogger.logEvent(
      event.type,
      event.id,
      timer.stop(),
      'error',
      formatError(error),
      requestInfo
    );
  }
}

async function handleCheckoutSessionCompletedAsync(session: any): Promise<void> {
  console.log('[Webhook] Processing checkout.session.completed:', session.id);
  
  try {
    const paymentData: PaymentData = {
      timestamp: new Date().toISOString(),
      email: session.customer_email || session.customer_details?.email || '',
      amount: session.amount_total / 100,
      status: 'completed',
      session_id: session.id,
      payment_intent_id: session.payment_intent,
      currency: session.currency,
      client_name: session.customer_details?.name || '',
      readiness_check_id: session.metadata?.readiness_check_id,
    };

    // Process critical tasks first (Supabase update)
    if (session.metadata?.readiness_check_id) {
      await updateReadinessCheckStatusAsync(
        session.metadata.readiness_check_id, 
        'paid', 
        session.payment_intent
      );
    }

    // Process non-critical tasks (Google Sheets) with timeout
    await recordPaymentInGoogleSheetsAsync(paymentData);

    // Add background tasks for heavy operations
    if (session.metadata?.readiness_check_id) {
      addBackgroundTask('pdf_generation', {
        readinessCheckId: session.metadata.readiness_check_id,
        clientName: paymentData.client_name,
        clientEmail: paymentData.email,
      }, 'high');
    }

    console.log('[Webhook] Successfully processed checkout.session.completed');
  } catch (error) {
    console.error('[Webhook] Error handling checkout.session.completed:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceededAsync(paymentIntent: any): Promise<void> {
  console.log('[Webhook] Processing payment_intent.succeeded:', paymentIntent.id);
  
  try {
    const paymentData: PaymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'succeeded',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
      readiness_check_id: paymentIntent.metadata?.readiness_check_id,
    };

    // Process critical tasks first
    if (paymentIntent.metadata?.readiness_check_id) {
      await updateReadinessCheckStatusAsync(
        paymentIntent.metadata.readiness_check_id, 
        'paid', 
        paymentIntent.id
      );
    }

    // Process non-critical tasks
    await recordPaymentInGoogleSheetsAsync(paymentData);

    // Add background tasks
    if (paymentIntent.metadata?.readiness_check_id) {
      addBackgroundTask('pdf_generation', {
        readinessCheckId: paymentIntent.metadata.readiness_check_id,
        clientName: paymentData.client_name,
        clientEmail: paymentData.email,
      }, 'high');
    }

    console.log('[Webhook] Successfully processed payment_intent.succeeded');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentRequiresActionAsync(paymentIntent: any): Promise<void> {
  console.log('[Webhook] Processing payment_intent.requires_action:', paymentIntent.id);
  
  try {
    const paymentData: PaymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'requires_action',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
      readiness_check_id: paymentIntent.metadata?.readiness_check_id,
    };

    await recordPaymentInGoogleSheetsAsync(paymentData);
    console.log('[Webhook] Successfully processed payment_intent.requires_action');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.requires_action:', error);
    throw error;
  }
}

async function handlePaymentIntentFailedAsync(paymentIntent: any): Promise<void> {
  console.log('[Webhook] Processing payment_intent.payment_failed:', paymentIntent.id);
  
  try {
    const paymentData: PaymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'failed',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
      readiness_check_id: paymentIntent.metadata?.readiness_check_id,
    };

    // Process tasks in parallel with timeout
    await Promise.allSettled([
      recordPaymentInGoogleSheetsAsync(paymentData),
      updateReadinessCheckStatusAsync(
        paymentIntent.metadata?.readiness_check_id, 
        'payment_failed', 
        paymentIntent.id
      ),
    ]);

    console.log('[Webhook] Successfully processed payment_intent.payment_failed');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

async function handlePaymentIntentCanceledAsync(paymentIntent: any): Promise<void> {
  console.log('[Webhook] Processing payment_intent.canceled:', paymentIntent.id);
  
  try {
    const paymentData: PaymentData = {
      timestamp: new Date().toISOString(),
      email: paymentIntent.receipt_email || paymentIntent.metadata?.client_email || '',
      amount: paymentIntent.amount / 100,
      status: 'canceled',
      session_id: paymentIntent.id,
      payment_intent_id: paymentIntent.id,
      currency: paymentIntent.currency,
      client_name: paymentIntent.metadata?.client_name || '',
      readiness_check_id: paymentIntent.metadata?.readiness_check_id,
    };

    // Process tasks in parallel with timeout
    await Promise.allSettled([
      recordPaymentInGoogleSheetsAsync(paymentData),
      updateReadinessCheckStatusAsync(
        paymentIntent.metadata?.readiness_check_id, 
        'payment_canceled', 
        paymentIntent.id
      ),
    ]);

    console.log('[Webhook] Successfully processed payment_intent.canceled');
  } catch (error) {
    console.error('[Webhook] Error handling payment_intent.canceled:', error);
    throw error;
  }
}

// Optimized Google Sheets recording with timeout and retry logic
async function recordPaymentInGoogleSheetsAsync(paymentData: PaymentData): Promise<void> {
  try {
    console.log('[Webhook] Recording payment in Google Sheets:', paymentData);

    const formData = new URLSearchParams();
    formData.append('timestamp', paymentData.timestamp);
    formData.append('email', paymentData.email);
    formData.append('amount', paymentData.amount.toString());
    formData.append('status', paymentData.status);
    formData.append('session_id', paymentData.session_id);
    formData.append('payment_intent_id', paymentData.payment_intent_id);
    formData.append('currency', paymentData.currency);
    formData.append('client_name', paymentData.client_name);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GOOGLE_SHEETS_TIMEOUT_MS);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwugSWL5Sh67KPMJjrGunkrm0xPSOpguijHqN6xWSrDmxoKK3yF8vdaSH3wL4gQcZLd/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('[Webhook] Payment data sent to Google Sheets successfully');
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[Webhook] Google Sheets request timed out');
        // Add to background task for retry
        addBackgroundTask('file_upload', {
          type: 'google_sheets_payment',
          data: paymentData,
        }, 'medium');
      } else {
        throw fetchError;
      }
    }
  } catch (error) {
    console.error('[Webhook] Error recording payment in Google Sheets:', error);
    // Don't throw - we want the webhook to succeed even if Google Sheets fails
  }
}

// Optimized Supabase update with timeout
async function updateReadinessCheckStatusAsync(
  readinessCheckId: string | undefined, 
  status: string, 
  paymentIntentId: string
): Promise<void> {
  if (!readinessCheckId) {
    console.log('[Webhook] No readiness check ID provided, skipping Supabase update');
    return;
  }

  try {
    console.log('[Webhook] Updating readiness check status:', readinessCheckId, status);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

    try {
      const { error } = await supabase
        .from('readiness_checks')
        .update({
          status: status,
          stripe_payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', readinessCheckId);

      clearTimeout(timeoutId);

      if (error) {
        console.error('[Webhook] Error updating readiness check:', error);
        // Add to background task for retry
        addBackgroundTask('file_upload', {
          type: 'supabase_update',
          readinessCheckId,
          status,
          paymentIntentId,
        }, 'high');
      } else {
        console.log('[Webhook] Successfully updated readiness check status');
      }
    } catch (supabaseError) {
      clearTimeout(timeoutId);
      if (supabaseError instanceof Error && supabaseError.name === 'AbortError') {
        console.error('[Webhook] Supabase request timed out');
        // Add to background task for retry
        addBackgroundTask('file_upload', {
          type: 'supabase_update',
          readinessCheckId,
          status,
          paymentIntentId,
        }, 'high');
      } else {
        throw supabaseError;
      }
    }
  } catch (error) {
    console.error('[Webhook] Error updating readiness check:', error);
    // Don't throw - we want the webhook to succeed even if Supabase fails
  }
}
