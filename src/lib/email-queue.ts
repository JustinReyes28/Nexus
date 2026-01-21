import { sendEmail } from "./email";

type EmailJob = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  retries: number;
  nextAttemptAt?: number;
};

class EmailQueue {
  private queue: EmailJob[] = [];
  private isProcessing = false;
  private static readonly MAX_RETRIES = 3;
  private static readonly BATCH_SIZE = 5;
  private static readonly baseDelayMs = 1000;
  private static readonly maxBackoff = 30000;

  add(job: Omit<EmailJob, "retries">) {
    this.queue.push({ ...job, retries: 0 });
    if (!this.isProcessing) {
      this.process();
    }
  }

  private async process() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const now = Date.now();
    // Find indices of eligible jobs (up to BATCH_SIZE)
    const eligibleIndices: number[] = [];
    for (let i = 0; i < this.queue.length && eligibleIndices.length < EmailQueue.BATCH_SIZE; i++) {
      const job = this.queue[i];
      if (!job.nextAttemptAt || job.nextAttemptAt <= now) {
        eligibleIndices.push(i);
      }
    }
    
    // Extract jobs from queue in reverse order to maintain correct indices
    const batch: EmailJob[] = [];
    for (let i = eligibleIndices.length - 1; i >= 0; i--) {
      batch.unshift(this.queue.splice(eligibleIndices[i], 1)[0]);
    }
    
    await Promise.all(
      batch.map(async (job) => {
        try {
          const result = await sendEmail(job);
          if (!result.success && job.retries < EmailQueue.MAX_RETRIES) {
            const delay = Math.min(EmailQueue.baseDelayMs * 2 ** job.retries, EmailQueue.maxBackoff);
            const nextAttemptAt = Date.now() + delay;
            this.queue.push({ ...job, retries: job.retries + 1, nextAttemptAt });
          }
        } catch (error) {
          console.error(`Failed to send email job: ${error}`);
          if (job.retries < EmailQueue.MAX_RETRIES) {
            const delay = Math.min(EmailQueue.baseDelayMs * 2 ** job.retries, EmailQueue.maxBackoff);
            const nextAttemptAt = Date.now() + delay;
            this.queue.push({ ...job, retries: job.retries + 1, nextAttemptAt });
          } else {
            console.error(`Max retries exceeded for job to ${job.to}, moving to dead letter`);
          }
        }
      })
    );

    // Continue processing batches
    setTimeout(() => this.process(), 0);
  }
}

export const emailQueue = new EmailQueue();
export { EmailQueue };
