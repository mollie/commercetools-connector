import { NextFunction, Request, Response } from 'express';
import { readConfiguration } from '../utils/config.utils';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { clientId, clientSecret } = readConfiguration().commerceTools;

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username !== clientId || password !== clientSecret) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  next();
};
