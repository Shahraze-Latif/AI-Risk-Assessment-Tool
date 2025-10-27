// Background task processor for heavy operations
// This can be used for PDF generation, email sending, etc.

interface BackgroundTask {
  id: string;
  type: 'pdf_generation' | 'email_sending' | 'file_upload';
  data: any;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  maxRetries: number;
  retryCount: number;
}

class BackgroundTaskProcessor {
  private tasks: BackgroundTask[] = [];
  private isProcessing = false;
  private readonly maxConcurrentTasks = 3;

  // Add a task to the queue
  addTask(task: Omit<BackgroundTask, 'id' | 'createdAt' | 'retryCount'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: BackgroundTask = {
      ...task,
      id: taskId,
      createdAt: new Date(),
      retryCount: 0,
    };

    this.tasks.push(newTask);
    console.log(`[BackgroundTask] Added task ${taskId} of type ${task.type}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processTasks();
    }

    return taskId;
  }

  // Process tasks in the queue
  private async processTasks(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('[BackgroundTask] Starting task processor');

    while (this.tasks.length > 0) {
      const batch = this.tasks.splice(0, this.maxConcurrentTasks);
      
      // Process batch in parallel
      await Promise.allSettled(
        batch.map(task => this.processTask(task))
      );
    }

    this.isProcessing = false;
    console.log('[BackgroundTask] Task processor finished');
  }

  // Process individual task
  private async processTask(task: BackgroundTask): Promise<void> {
    try {
      console.log(`[BackgroundTask] Processing task ${task.id} of type ${task.type}`);

      switch (task.type) {
        case 'pdf_generation':
          await this.handlePdfGeneration(task);
          break;
        case 'email_sending':
          await this.handleEmailSending(task);
          break;
        case 'file_upload':
          await this.handleFileUpload(task);
          break;
        default:
          console.error(`[BackgroundTask] Unknown task type: ${task.type}`);
      }

      console.log(`[BackgroundTask] Successfully processed task ${task.id}`);
    } catch (error) {
      console.error(`[BackgroundTask] Error processing task ${task.id}:`, error);
      
      // Retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        console.log(`[BackgroundTask] Retrying task ${task.id} (attempt ${task.retryCount + 1})`);
        
        // Add back to queue with delay
        setTimeout(() => {
          this.tasks.push(task);
          if (!this.isProcessing) {
            this.processTasks();
          }
        }, Math.pow(2, task.retryCount) * 1000); // Exponential backoff
      } else {
        console.error(`[BackgroundTask] Task ${task.id} failed after ${task.maxRetries} retries`);
      }
    }
  }

  // Handle PDF generation
  private async handlePdfGeneration(task: BackgroundTask): Promise<void> {
    const { readinessCheckId, clientName, clientEmail } = task.data;
    
    console.log(`[BackgroundTask] Generating PDF for readiness check ${readinessCheckId}`);
    
    // Add your PDF generation logic here
    // This is where you'd call your PDF generation service
    
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[BackgroundTask] PDF generated for ${clientName}`);
  }

  // Handle email sending
  private async handleEmailSending(task: BackgroundTask): Promise<void> {
    const { clientEmail, clientName, pdfUrl } = task.data;
    
    console.log(`[BackgroundTask] Sending email to ${clientEmail}`);
    
    // Add your email sending logic here
    // This is where you'd call your email service
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`[BackgroundTask] Email sent to ${clientName}`);
  }

  // Handle file upload
  private async handleFileUpload(task: BackgroundTask): Promise<void> {
    const { fileData, fileName } = task.data;
    
    console.log(`[BackgroundTask] Uploading file ${fileName}`);
    
    // Add your file upload logic here
    // This is where you'd call your file storage service
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`[BackgroundTask] File ${fileName} uploaded successfully`);
  }
}

// Export singleton instance
export const backgroundTaskProcessor = new BackgroundTaskProcessor();

// Helper function to add tasks from webhook handlers
export function addBackgroundTask(
  type: BackgroundTask['type'],
  data: any,
  priority: BackgroundTask['priority'] = 'medium',
  maxRetries: number = 3
): string {
  return backgroundTaskProcessor.addTask({
    type,
    data,
    priority,
    maxRetries,
  });
}
