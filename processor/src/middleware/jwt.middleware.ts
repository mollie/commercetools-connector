import { NextFunction, Request, Response } from 'express';
import { paymentSdk } from '../sdk/payment.sdk';

export const jwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  await paymentSdk.jwtAuthHookFn
    .authenticate()(req)
    .then(() => next())
    .catch(() => {
      res.status(403).send('Access denied: You do not have the necessary permissions to access this resource.');
    });
};
