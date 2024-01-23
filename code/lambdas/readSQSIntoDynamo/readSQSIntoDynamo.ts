import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Handler, SQSEvent, SQSRecord } from "aws-lambda";

const dynamoClient = new DynamoDBClient({});
const tableName = process.env.DYNAMO_TABLE_NAME;

export const handler: Handler = async (event: SQSEvent) => {
  const batchItemFailures = [];
  for (const record of event.Records) {
    try {
      const result = await handleRecord(record);
      console.log({ result });
    } catch (error) {
      batchItemFailures.push({ ItemIdentifier: record.messageId });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ batchItemFailures }),
  };
};

async function handleRecord(record: SQSRecord) {
  if (record.body.length > 25) {
    throw new Error("Can't process more than 25 items per record");
  }

  const body = JSON.parse(record.body);
  if (!Array.isArray(body)) {
    throw new Error(`Expected array of cities, got something else:${body}`);
  }

  const writeCommand = new BatchWriteItemCommand({
    RequestItems: {
      tableName: body.map((city) => {
        city.status = "";

        return { PutRequest: { Item: marshall(city) } };
      }),
    },
  });

  return dynamoClient.send(writeCommand);
}
