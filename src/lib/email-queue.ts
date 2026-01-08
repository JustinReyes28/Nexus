import { sendEmail } from "./email";

type EmailJob = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  retries: number;
};

class EmailQueue {
  private queue: EmailJob[] = [];
  private isProcessing = false;
  private MAX_RETRIES = 3;
  private BATCH_SIZE = 5;

  async add(job: Omit<EmailJob, "retries">) {
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
    const batch = this.queue.splice(0, this.BATCH_SIZE);
    
    await Promise.all(batch.map(async (job) => {
      const result = await sendEmail(job);
      if (!result.success && job.retries < this.MAX_RETRIES) {
        this.queue.push({ ...job, retries: job.retries + 1 });
      }
    }));

    // Wait 1 second between batches to avoid rate limits
    setTimeout(() => this.process(), 1000);
  }
}

export const emailQueue = new EmailQueue();
