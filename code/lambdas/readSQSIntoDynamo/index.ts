import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");

type NodejsFunctionPropsWithName = NodejsFunctionProps & {
  functionName: string;
};

export const definition: NodejsFunctionPropsWithName = {
  handler: "handler",
  runtime: Runtime.NODEJS_20_X,
  functionName: `readSQSIntoDynamo`,
  entry: path.join(__dirname, "readSQSIntoDynamo.ts"),
};
