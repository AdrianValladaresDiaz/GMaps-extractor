import * as cdk from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { definition as ingestCitiesFromS3 } from "../../code/lambdas/ingestCitiesFromS3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class MapsInfoExtractorAppStack extends cdk.Stack {
  bucket: Bucket;
  citiesTable: Table;

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

    new NodejsFunction(
      this,
      ingestCitiesFromS3.functionName,
      ingestCitiesFromS3
    );
  }
}