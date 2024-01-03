import { Handler, SQSEvent } from "aws-lambda";

type IngestEvent = { file: string; bucket: string };

export const handler: Handler = async (event: SQSEvent) => {
  const batchItemFailures = [];
  for (const record of event.Records) {
    try {
      await processMessageAsync(record, context);
    } catch (error) {
      batchItemFailures.push({ ItemIdentifier: record.messageId });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ batchItemFailures }),
  };
};
