import { Router } from 'express';
import { post } from '../controllers/processor.controller';
import { install, healthCheck, uninstall, mollieStatus } from '../controllers/connector.controller';
import { readConfiguration } from '../utils/config.utils';
import { oauthMiddleware } from '../middleware/oauth2.middleware';

const serviceRouter = Router();
const AUTH_MODE = readConfiguration().commerceTools.authMode === '1';

serviceRouter.get('/health-check', healthCheck);

serviceRouter.get('/mollie/status', mollieStatus);

if (AUTH_MODE) {
  serviceRouter.post('/', oauthMiddleware, post);
  serviceRouter.post('/install', oauthMiddleware, install);
  serviceRouter.post('/uninstall', oauthMiddleware, uninstall);
} else {
  serviceRouter.post('/', post);
  serviceRouter.post('/install', install);
  serviceRouter.post('/uninstall', uninstall);
}

export default serviceRouter;
