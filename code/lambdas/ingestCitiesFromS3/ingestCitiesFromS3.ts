import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { parse } from "csv-parse";
import { Handler } from "aws-lambda";
import { Readable } from "stream";

import { ReadableStream as WebStream } from "stream/web";
import { StreamLogger } from "../../utils/StreamLogger";
import { RecordAccumulator } from "../../utils/RecordAccumulator";

type IngestEvent = { file: string; bucket: string };

export const handler: Handler = async (event: IngestEvent) => {
  const s3Client = new S3Client();

  const getObjectCommand = new GetObjectCommand({
    Bucket: event.bucket,
    Key: event.file,
  });
  const objectResponse = await s3Client.send(getObjectCommand);
  if (!objectResponse.Body) {
    return "Could not find object in S3, or got empty body";
  }

  const streamingBlob = objectResponse.Body.transformToWebStream();
  const csvParser = declareCsvParser();
  const accumulator = new RecordAccumulator(3);
  const logger = new StreamLogger();

  const modernReader = Readable.fromWeb(streamingBlob as WebStream);
  modernReader.pipe(csvParser).pipe(accumulator).pipe(logger);
  return "wololoo";
};

const declareCsvParser = () => {
  const csvParser = parse({ columns: true });

  csvParser.on("error", (err) => {
    console.log("parser caught error");
    console.log(err);
  });

  csvParser.on("end", () => {
    console.log("parser done");
  });

  return csvParser;
};
