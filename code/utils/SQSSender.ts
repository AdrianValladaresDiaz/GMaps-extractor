import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Writable } from "stream";

class Stack<T = number> {
  private memArr: Array<T> = [];

  constructor() {}

  get isEmpty() {
    return this.memArr.length === 0;
  }

  push(num: T) {
    this.memArr.push(num);
  }

  pop() {
    return this.memArr.pop();
  }
}

export class SQSSender extends Writable {
  private sqsClient: SQSClient;
  private indexStack: Stack;
  private memory = new Map();

  constructor(client: SQSClient, highWaterMark: number = 500) {
    super({ objectMode: true, highWaterMark });
    this.sqsClient = client;
    this.indexStack = new Stack<number>();
    // Initialize index stack to the size of the internal buffer + some leeway
    for (let i = 0; i < highWaterMark + 20; i++) {
      this.indexStack.push(i);
    }
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.sendEvent(chunk);
    callback();
  }

  private async sendEvent(chunk: any) {
    console.log("CHUNK", chunk);
    if (this.indexStack.isEmpty) {
      console.log(Stack);
      throw new Error("Attempting to get from Stack while it is empty");
    }
    const index = this.indexStack.pop()!; // Will always work if stack is not empty
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify(chunk),
      QueueUrl: process.env.TARGET_SQS_URL,
    });
    const sqsPromise = this.sqsClient.send(command);
    this.memory.set(index, sqsPromise);
    await sqsPromise;
    this.memory.delete(index);
    this.indexStack.push(index);
  }
}
