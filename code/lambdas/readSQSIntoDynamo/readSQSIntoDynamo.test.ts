import { mockClient } from "aws-sdk-client-mock";
import { handler } from "./readSQSIntoDynamo";
import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { Context, SQSEvent } from "aws-lambda";
import "aws-sdk-client-mock-jest";

const dynamoClientMock = mockClient(DynamoDBClient);

const event: SQSEvent = {
  Records: [
    {
      messageId: "6adeafac-63d3-48e9-ab0a-69acde0ec1b0",
      receiptHandle:
        "AQEBmzpmgXprBtSWWEyeHLO8SDw698eF2j3B+pCPphHI1mwmfpynsIk3vOqIdF8hBUKFK6BHWuG/5UXil/rjpUMZeVqN88iZ9KkFPdGY/5HkEe8ZcQ9bN9r/BRwI5zaw+IG7qxTSB4R6zAA7qJu8xy7DwlZjBZ3IBTjQu2/IbV3qt7+tn32i4BkZ9evPr1hvj+EG2aeqpHd2Fcle2IxJtS741zb6kzp1ifcsO38BEIDwIyOXkZpZZ/1f9jswnpyri7XvQXl/EwFu/0OxCJPCSpceAjceQSiwFTXQSb1wsRJunUoEzCtjBwx929wN2tKWVdKdOLeWyKg254NUf2pgFOdSMB4b9Mtbq18Q2p5l+n0ofCMP+dsQ5u+jLYXtr4eD7zBd2oYBhVlhjDE2uEmx531pSE+DHoPUkUL7zYWGnbIPLbE=",
      body: '[{"city":"Tokyo","city_ascii":"Tokyo","lat":"35.6897","lng":"139.6922","country":"Japan","iso2":"JP","iso3":"JPN","admin_name":"Tōkyō","capital":"primary","population":"37732000","id":"1392685764"},{"city":"Jakarta","city_ascii":"Jakarta","lat":"-6.1750","lng":"106.8275","country":"Indonesia","iso2":"ID","iso3":"IDN","admin_name":"Jakarta","capital":"primary","population":"33756000","id":"1360771077"},{"city":"Delhi","city_ascii":"Delhi","lat":"28.6100","lng":"77.2300","country":"India","iso2":"IN","iso3":"IND","admin_name":"Delhi","capital":"admin","population":"32226000","id":"1356872604"},{"city":"Guangzhou","city_ascii":"Guangzhou","lat":"23.1300","lng":"113.2600","country":"China","iso2":"CN","iso3":"CHN","admin_name":"Guangdong","capital":"admin","population":"26940000","id":"1156237133"},{"city":"Mumbai","city_ascii":"Mumbai","lat":"19.0761","lng":"72.8775","country":"India","iso2":"IN","iso3":"IND","admin_name":"Mahārāshtra","capital":"admin","population":"24973000","id":"1356226629"}]',
      attributes: {
        ApproximateReceiveCount: "1",
        AWSTraceHeader:
          "Root=1-65af9376-634beb30162440443e2615ac;Parent=391b85e0153acf45;Sampled=0;Lineage=22ffc649:0",
        SentTimestamp: "1706005379372",
        SenderId: "AROA3B2YTD232JQ3IHMZW:ingestCitiesFromS3-lambda-prod",
        ApproximateFirstReceiveTimestamp: "1706005379373",
      },
      messageAttributes: {},
      md5OfBody: "4220c064ee0e43bf895e96fbef6b02b4",
      eventSource: "aws:sqs",
      eventSourceARN:
        "arn:aws:sqs:eu-central-1:759858142903:MIE-cityIngestion-queue-prod",
      awsRegion: "eu-central-1",
    },
  ],
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Given readSQSIntoDynamo", () => {
  describe("When it receives an event", () => {
    test("Then it should ", async () => {
      const expectedInput: BatchWriteItemCommandInput = { RequestItems: {} };
      const response = await handler(event, {} as Context, {} as any);

      expect(dynamoClientMock).toHaveReceivedCommandWith(
        BatchWriteItemCommand,
        {}
      );
    });
  });
});
