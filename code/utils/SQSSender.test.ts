import { mockClient } from "aws-sdk-client-mock";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSSender } from "./SQSSender";
import "aws-sdk-client-mock-jest";

const sqsClientMock = mockClient(SQSClient);
jest.mock("stream", () => ({ ...jest.requireActual("stream") }));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Given the SQS sender", () => {
  describe("When written to", () => {
    test("Should wordk", async () => {
      sqsClientMock.on(SendMessageCommand).resolves({});

      const testedSender = new SQSSender(
        sqsClientMock as unknown as SQSClient,
        10
      );

      testedSender.write({ name: "chunk" });

      expect(sqsClientMock).toHaveReceivedCommand(SendMessageCommand);
    });
  });
});
