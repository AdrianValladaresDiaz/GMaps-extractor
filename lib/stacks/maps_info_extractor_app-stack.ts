import * as cdk from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class MapsInfoExtractorAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, `MIE-general-bucket-${process.env.STAGE}`, {
      encryption: BucketEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      bucketName: `adrivalla-personal-bucket-${process.env.STAGE}`,
    });

    const dynamoTable = new Table(
      this,
      `MIE-general-table-${process.env.STAGE}`
    );
  }
}
