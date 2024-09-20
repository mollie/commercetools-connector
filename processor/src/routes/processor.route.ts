import { Router } from 'express';
import { post } from '../controllers/processor.controller';
import { install, healthCheck, uninstall, mollieStatus } from '../controllers/connector.controller';

const serviceRouter = Router();

serviceRouter.post('/', post);

serviceRouter.get('/health-check', healthCheck);

serviceRouter.get('/mollie/status', mollieStatus);

serviceRouter.post('/install', install);

serviceRouter.post('/uninstall', uninstall);

export default serviceRouter;
