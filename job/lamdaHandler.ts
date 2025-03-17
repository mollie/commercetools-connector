import { APIGatewayProxyEvent } from 'aws-lambda';
import { updatePaymentExtensionAccessToken } from './src/service/job.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.handler = async (event: APIGatewayProxyEvent) => {
  try {
    await updatePaymentExtensionAccessToken();

    return {
      statusCode: 200,
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      error: error,
    };
  }
};
