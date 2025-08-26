import { Router } from 'express';
import { post } from '../controllers/processor.controller';
import { install, healthCheck, uninstall, mollieStatus } from '../controllers/connector.controller';
import { readConfiguration } from '../utils/config.utils';
import { basicAuthMiddleware } from '../middleware/basicAuth.middleware';

const serviceRouter = Router();
const AUTH_MODE = readConfiguration().commerceTools.authMode === '1';

serviceRouter.get('/health-check', healthCheck);

serviceRouter.get('/mollie/status', mollieStatus);

if (AUTH_MODE) {
  serviceRouter.post('/', basicAuthMiddleware, post);
  serviceRouter.post('/install', basicAuthMiddleware, install);
  serviceRouter.post('/uninstall', basicAuthMiddleware, uninstall);
} else {
  serviceRouter.post('/', post);
  serviceRouter.post('/install', install);
  serviceRouter.post('/uninstall', uninstall);
}

export default serviceRouter;
