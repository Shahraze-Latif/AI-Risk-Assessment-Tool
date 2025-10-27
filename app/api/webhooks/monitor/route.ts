import { NextRequest, NextResponse } from 'next/server';
import { webhookLogger } from '@/lib/webhookLogger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        return getWebhookStats();
      case 'logs':
        return getWebhookLogs(searchParams);
      case 'health':
        return getWebhookHealth();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[WebhookMonitor] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getWebhookStats() {
  const stats = webhookLogger.getPerformanceStats();
  const recentLogs = webhookLogger.getRecentLogs(10);
  
  return NextResponse.json({
    performance: stats,
    recent_events: recentLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      event_type: log.eventType,
      event_id: log.eventId,
      processing_time_ms: log.processingTime,
      status: log.status,
      error_message: log.errorMessage,
    })),
    summary: {
      total_events: stats.totalEvents,
      success_rate: `${stats.successRate}%`,
      average_response_time: `${stats.averageProcessingTime}ms`,
      error_count: stats.errorCount,
      timeout_count: stats.timeoutCount,
    }
  });
}

function getWebhookLogs(searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status') as 'success' | 'error' | 'timeout' | null;
  
  let logs;
  if (status) {
    logs = webhookLogger.getLogsByStatus(status);
  } else {
    logs = webhookLogger.getRecentLogs(limit);
  }
  
  return NextResponse.json({
    logs: logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      event_type: log.eventType,
      event_id: log.eventId,
      processing_time_ms: log.processingTime,
      status: log.status,
      error_message: log.errorMessage,
      metadata: log.metadata,
    })),
    count: logs.length,
    filters: {
      limit,
      status,
    }
  });
}

function getWebhookHealth() {
  const stats = webhookLogger.getPerformanceStats();
  const recentLogs = webhookLogger.getRecentLogs(5);
  
  // Check if there are recent errors
  const recentErrors = recentLogs.filter(log => log.status === 'error');
  const hasRecentErrors = recentErrors.length > 0;
  
  // Check if response times are reasonable
  const slowResponses = recentLogs.filter(log => log.processingTime > 5000);
  const hasSlowResponses = slowResponses.length > 0;
  
  const healthStatus = hasRecentErrors || hasSlowResponses ? 'warning' : 'healthy';
  
  return NextResponse.json({
    status: healthStatus,
    timestamp: new Date().toISOString(),
    checks: {
      recent_errors: {
        status: hasRecentErrors ? 'warning' : 'ok',
        count: recentErrors.length,
        details: recentErrors.map(log => ({
          event_type: log.eventType,
          error_message: log.errorMessage,
          timestamp: log.timestamp,
        }))
      },
      response_times: {
        status: hasSlowResponses ? 'warning' : 'ok',
        slow_responses: slowResponses.length,
        average_response_time: stats.averageProcessingTime,
      },
      overall_performance: {
        success_rate: stats.successRate,
        total_events: stats.totalEvents,
      }
    },
    recommendations: generateRecommendations(stats, recentLogs)
  });
}

function generateRecommendations(stats: any, recentLogs: any[]): string[] {
  const recommendations: string[] = [];
  
  if (stats.successRate < 95) {
    recommendations.push('Success rate is below 95%. Check error logs for issues.');
  }
  
  if (stats.averageProcessingTime > 3000) {
    recommendations.push('Average response time is high. Consider optimizing webhook processing.');
  }
  
  const timeoutCount = stats.timeoutCount;
  if (timeoutCount > 0) {
    recommendations.push(`${timeoutCount} timeout(s) detected. Check external service dependencies.`);
  }
  
  const recentErrors = recentLogs.filter(log => log.status === 'error');
  if (recentErrors.length > 0) {
    recommendations.push('Recent errors detected. Check webhook implementation and external services.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Webhook is performing well. No immediate action required.');
  }
  
  return recommendations;
}
