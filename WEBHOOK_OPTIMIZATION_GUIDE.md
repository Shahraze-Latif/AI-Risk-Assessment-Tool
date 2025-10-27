# Optimized Stripe Webhook Handler

## 🚀 **Performance Optimizations Implemented**

### **1. Immediate Response Strategy**
- **Responds to Stripe within 8 seconds** (well under the 10-second limit)
- **Processes heavy tasks asynchronously** after sending 200 OK response
- **Prevents timeout errors** by separating critical and non-critical operations

### **2. Timeout Management**
- **Google Sheets API**: 5-second timeout with retry logic
- **Supabase Updates**: 3-second timeout with background retry
- **Overall webhook**: 8-second maximum response time
- **Automatic retry** for failed operations via background task processor

### **3. Background Task Processing**
- **PDF Generation**: Moved to background tasks
- **Email Sending**: Handled asynchronously
- **File Uploads**: Retry mechanism for failed uploads
- **Exponential backoff** for retry attempts

### **4. Comprehensive Logging & Monitoring**
- **Structured logging** with performance metrics
- **Error tracking** with detailed context
- **Performance monitoring** with success rates and response times
- **Webhook health checks** via `/api/webhooks/monitor`

## 📊 **Key Features**

### **Response Time Optimization**
```typescript
// Responds immediately to Stripe
const response = NextResponse.json({ 
  received: true, 
  event_id: eventId,
  processed_at: new Date().toISOString(),
  response_time_ms: timer.stop()
});

// Process heavy tasks asynchronously
processWebhookEventAsync(event, requestInfo).catch(error => {
  console.error('[Webhook] Async processing error:', error);
});
```

### **Timeout Protection**
```typescript
// Google Sheets with 5-second timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), GOOGLE_SHEETS_TIMEOUT_MS);

// Supabase with 3-second timeout
const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
```

### **Background Task Queue**
```typescript
// Add heavy operations to background queue
addBackgroundTask('pdf_generation', {
  readinessCheckId: session.metadata.readiness_check_id,
  clientName: paymentData.client_name,
  clientEmail: paymentData.email,
}, 'high');
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
STRIPE_SECRET_KEY=sk_test_*************
STRIPE_WEBHOOK_SECRET=whsec_*************
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*************
```

### **Timeout Settings**
```typescript
const WEBHOOK_TIMEOUT_MS = 8000;        // 8 seconds max response
const GOOGLE_SHEETS_TIMEOUT_MS = 5000;  // 5 seconds for Google Sheets
const SUPABASE_TIMEOUT_MS = 3000;       // 3 seconds for Supabase
```

## 📈 **Monitoring & Debugging**

### **Webhook Monitor Endpoint**
Access monitoring at: `/api/webhooks/monitor`

**Available Actions:**
- `?action=stats` - Performance statistics
- `?action=logs` - Recent webhook logs
- `?action=health` - Health check with recommendations

### **Example Monitor Response**
```json
{
  "status": "healthy",
  "performance": {
    "totalEvents": 150,
    "successRate": 98.67,
    "averageProcessingTime": 1250,
    "errorCount": 2,
    "timeoutCount": 0
  },
  "recommendations": [
    "Webhook is performing well. No immediate action required."
  ]
}
```

## 🛠 **Event Handling**

### **Supported Events**
- `checkout.session.completed` ✅
- `payment_intent.succeeded` ✅
- `payment_intent.requires_action` ✅
- `payment_intent.payment_failed` ✅
- `payment_intent.canceled` ✅

### **Processing Flow**
1. **Verify webhook signature** (< 100ms)
2. **Respond to Stripe immediately** (< 8 seconds)
3. **Process critical tasks** (Supabase updates)
4. **Process non-critical tasks** (Google Sheets)
5. **Queue background tasks** (PDF generation, emails)

## 🔍 **Error Handling**

### **Graceful Degradation**
- **Google Sheets fails** → Queued for retry, webhook still succeeds
- **Supabase fails** → Queued for retry, webhook still succeeds
- **Background tasks fail** → Exponential backoff retry
- **Signature verification fails** → Returns 400 error immediately

### **Retry Logic**
```typescript
// Exponential backoff for retries
setTimeout(() => {
  this.tasks.push(task);
  if (!this.isProcessing) {
    this.processTasks();
  }
}, Math.pow(2, task.retryCount) * 1000); // 1s, 2s, 4s, 8s...
```

## 📝 **Logging Structure**

### **Success Log**
```json
{
  "webhook_log": {
    "id": "log_1234567890_abc123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "event_type": "payment_intent.succeeded",
    "event_id": "evt_1234567890",
    "processing_time_ms": 1250,
    "status": "success",
    "metadata": {
      "userAgent": "Stripe/1.0",
      "ip": "192.168.1.1"
    }
  }
}
```

### **Error Log**
```json
{
  "webhook_log": {
    "id": "log_1234567890_def456",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "event_type": "checkout.session.completed",
    "event_id": "evt_1234567890",
    "processing_time_ms": 5000,
    "status": "error",
    "error_message": "Google Sheets request timed out",
    "metadata": {
      "userAgent": "Stripe/1.0",
      "ip": "192.168.1.1"
    }
  }
}
```

## 🚀 **Deployment Checklist**

### **Before Deployment**
- [ ] Set `STRIPE_WEBHOOK_SECRET` in environment variables
- [ ] Update webhook endpoint URL in Stripe Dashboard
- [ ] Test webhook with Stripe CLI or dashboard
- [ ] Verify Google Sheets integration
- [ ] Check Supabase connection

### **After Deployment**
- [ ] Monitor webhook performance via `/api/webhooks/monitor`
- [ ] Check Vercel logs for any errors
- [ ] Verify payments are recorded in Google Sheets
- [ ] Test with real payment events

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Webhook Timeout**
- Check external service response times
- Verify timeout settings are appropriate
- Monitor background task queue

**2. Signature Verification Failed**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL matches Stripe Dashboard
- Ensure raw body is being sent (not parsed JSON)

**3. Google Sheets Not Updating**
- Check Google Apps Script is deployed
- Verify script URL is correct
- Monitor background task retries

**4. Supabase Updates Failing**
- Verify Supabase credentials
- Check table permissions
- Monitor connection timeouts

### **Debug Commands**
```bash
# Check webhook health
curl https://your-domain.com/api/webhooks/monitor?action=health

# Get recent logs
curl https://your-domain.com/api/webhooks/monitor?action=logs&limit=10

# Get performance stats
curl https://your-domain.com/api/webhooks/monitor?action=stats
```

## 📊 **Performance Metrics**

### **Expected Performance**
- **Response Time**: < 2 seconds average
- **Success Rate**: > 95%
- **Timeout Rate**: < 1%
- **Error Rate**: < 5%

### **Monitoring Alerts**
- Response time > 5 seconds
- Success rate < 90%
- Error rate > 10%
- Timeout rate > 5%

## 🎯 **Best Practices**

1. **Always respond to Stripe within 10 seconds**
2. **Use background tasks for heavy operations**
3. **Implement proper retry logic with exponential backoff**
4. **Monitor webhook performance regularly**
5. **Log all operations for debugging**
6. **Handle errors gracefully without failing the webhook**
7. **Use timeouts to prevent hanging requests**
8. **Separate critical and non-critical operations**

This optimized webhook handler ensures reliable, fast, and scalable payment processing while maintaining data integrity and providing comprehensive monitoring capabilities.
