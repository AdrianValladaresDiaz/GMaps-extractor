import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Writable } from "stream";

export class SQSSender extends Writable {
  private sqsClient: SQSClient;
  private invokedPromises = 0;
  private successPromises = 0;
  private failedPromises = 0;

  constructor(client: SQSClient) {
    super({ objectMode: true });
    this.sqsClient = client;
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.sendToSQS(chunk);
    callback();
  }

  private async sendToSQS(chunk: any): Promise<void> {
    this.invokedPromises += 1;
    try {
      const command = new SendMessageCommand({
        MessageBody: JSON.stringify(chunk),
        QueueUrl: process.env.TARGET_SQS_URL,
      });
      await this.sqsClient.send(command);
      this.invokedPromises -= 1;
    } catch (error) {
      this.invokedPromises -= 1;
    }
  }

  _final(callback: (error?: Error | null | undefined) => void): void {
    let waiterPromise;
    setTimeout(() => (waiterPromise = "completed"), 1000 * 30);
    while (
      this.successPromises + this.failedPromises < this.invokedPromises ||
      waiterPromise === "completed"
    ) {
      // keep looping
    }
    console.log(
      `SQS Sender done with all requests. Sent: ${this.invokedPromises}. Success: ${this.successPromises}. Failures: ${this.failedPromises}`
    );
    callback();
  }
}
