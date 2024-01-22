import * as cdk from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { NodeLambdaWithIAMRole } from "../constructs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { definition as ingestCitiesFromS3 } from "../../code/lambdas/readCsvIntoSQS";
import { definition as readSQSIntoDynamo } from "../../code/lambdas/readSQSIntoDynamo";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class MapsInfoExtractorAppStack extends cdk.Stack {
  bucket: Bucket;
  citiesTable: Table;
  cityIngestionSQS: Queue;
  csvFromS3ToSQS: NodeLambdaWithIAMRole;
  readSQSIntoDynamo: NodeLambdaWithIAMRole;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, `MIE-general-bucket-${process.env.STAGE}`, {
      encryption: BucketEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: `mie-static-bucket-${process.env.STAGE}`,
    });

    const dynamoTable = new Table(
      this,
      `MIE-general-table-${process.env.STAGE}`,
      {
        partitionKey: { name: "id", type: AttributeType.STRING },
        deletionProtection: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        tableName: `MIE-general-table-${process.env.STAGE}`,
        sortKey: { name: "country", type: AttributeType.STRING },
      }
    );

    this.citiesTable = new Table(
      this,
      `MIE-cities-table-${process.env.STAGE}`,
      {
        partitionKey: { name: "id", type: AttributeType.STRING },
        deletionProtection: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        tableName: `MIE-cities-table-${process.env.STAGE}`,
        sortKey: { name: "status", type: AttributeType.STRING },
      }
    );

    this.cityIngestionSQS = new Queue(this, "cityIngestionQueue", {
      queueName: `MIE-cityIngestion-queue-${process.env.STAGE}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      visibilityTimeout: cdk.Duration.seconds(6 * 3), // 6 times lambda timeout
      retentionPeriod: cdk.Duration.seconds(60),
    });

    this.csvFromS3ToSQS = new NodeLambdaWithIAMRole(this, ingestCitiesFromS3);
    this.csvFromS3ToSQS.function.addEnvironment(
      "TARGET_SQS_URL",
      this.cityIngestionSQS.queueUrl
    );
    this.bucket.grantRead(this.csvFromS3ToSQS.role);
    this.cityIngestionSQS.grantSendMessages(this.csvFromS3ToSQS.role);

    this.readSQSIntoDynamo = new NodeLambdaWithIAMRole(this, readSQSIntoDynamo);
    this.readSQSIntoDynamo.function.addEventSource(
      new SqsEventSource(this.cityIngestionSQS, {
        reportBatchItemFailures: true,
        maxConcurrency: 100,
        enabled: true,
      })
    );
    this.cityIngestionSQS.grantConsumeMessages(this.readSQSIntoDynamo.role);
    this.citiesTable.grantWriteData(this.readSQSIntoDynamo.role);
  }
}
