import { createReadStream } from "fs";
import { mockClient } from "aws-sdk-client-mock";
import { handler, handler as ingestHandler } from "./ingestCitiesFromS3";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { Context } from "aws-lambda";

const s3ClientMock = mockClient(S3Client);
jest.mock("stream", () => ({ ...jest.requireActual("stream") }));

beforeEach(() => {
  jest.resetAllMocks();
});

test("", async () => {
  const fileStream = createReadStream(
    "/home/adri/projects/maps_info_extractor_app/static/testfile.csv"
  );
  Readable.fromWeb = () => fileStream;

  s3ClientMock
    .on(GetObjectCommand)
    .resolves({ Body: { transformToWebStream: () => ({}) } } as any);

  const response = await handler({}, {} as Context, {} as any);
  expect(response).toBe("wololoo");
});
