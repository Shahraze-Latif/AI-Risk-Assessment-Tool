// Webhook monitoring and logging utilities
import { NextRequest } from 'next/server';

interface WebhookLog {
  id: string;
  timestamp: Date;
  eventType: string;
  eventId: string;
  processingTime: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class WebhookLogger {
  private logs: WebhookLog[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs

  // Log webhook event
  logEvent(
    eventType: string,
    eventId: string,
    processingTime: number,
    status: 'success' | 'error' | 'timeout',
    errorMessage?: string,
    metadata?: Record<string, any>
  ): void {
    const log: WebhookLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      eventId,
      processingTime,
      status,
      errorMessage,
      metadata,
    };

    this.logs.push(log);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console with structured format
    const logMessage = {
      webhook_log: {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        event_type: log.eventType,
        event_id: log.eventId,
        processing_time_ms: log.processingTime,
        status: log.status,
        error_message: log.errorMessage,
        metadata: log.metadata,
      }
    };

    if (status === 'success') {
      console.log('[WebhookLogger] ✅', JSON.stringify(logMessage, null, 2));
    } else {
      console.error('[WebhookLogger] ❌', JSON.stringify(logMessage, null, 2));
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 50): WebhookLog[] {
    return this.logs.slice(-limit);
  }

  // Get logs by status
  getLogsByStatus(status: 'success' | 'error' | 'timeout'): WebhookLog[] {
    return this.logs.filter(log => log.status === status);
  }

  // Get performance statistics
  getPerformanceStats(): {
    totalEvents: number;
    successRate: number;
    averageProcessingTime: number;
    errorCount: number;
    timeoutCount: number;
  } {
    const totalEvents = this.logs.length;
    const successCount = this.logs.filter(log => log.status === 'success').length;
    const errorCount = this.logs.filter(log => log.status === 'error').length;
    const timeoutCount = this.logs.filter(log => log.status === 'timeout').length;
    
    const successRate = totalEvents > 0 ? (successCount / totalEvents) * 100 : 0;
    const averageProcessingTime = totalEvents > 0 
      ? this.logs.reduce((sum, log) => sum + log.processingTime, 0) / totalEvents 
      : 0;

    return {
      totalEvents,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      errorCount,
      timeoutCount,
    };
  }
}

// Export singleton instance
export const webhookLogger = new WebhookLogger();

// Helper function to extract request info
export function extractRequestInfo(request: NextRequest): {
  userAgent: string;
  ip: string;
  timestamp: Date;
} {
  return {
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    timestamp: new Date(),
  };
}

// Helper function to measure processing time
export function createTimer(): {
  start: () => void;
  stop: () => number;
} {
  let startTime: number;
  
  return {
    start: () => {
      startTime = Date.now();
    },
    stop: () => {
      return Date.now() - startTime;
    }
  };
}

// Helper function to validate webhook signature
export function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string
): { isValid: boolean; error?: string } {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    stripe.webhooks.constructEvent(body, signature, secret);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper function to format error messages
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

// Helper function to check if request is from Stripe
export function isStripeWebhook(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return userAgent.includes('Stripe');
}
