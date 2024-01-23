import { Duration } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type NodeLambdaWithIAMRoleProps = NodejsFunctionProps & {
  functionName: string;
};

export class NodeLambdaWithIAMRole extends Construct {
  function: NodejsFunction;
  role: Role;
  constructor(scope: Construct, props: NodeLambdaWithIAMRoleProps) {
    super(scope, props.functionName);
    this.role = new Role(this, `${props.functionName}-IAMRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: `${props.functionName}-IAMRole-${process.env.STAGE}`,
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    this.function = new NodejsFunction(
      this,
      `${props.functionName}-lambda-${process.env.STAGE}`,
      {
        handler: props.handler,
        runtime: props.runtime,
        functionName: `${props.functionName}-lambda-${process.env.STAGE}`,
        entry: props.entry,
        role: this.role,
        timeout: Duration.seconds(15),
        environment: {},
      }
    );
  }
}
