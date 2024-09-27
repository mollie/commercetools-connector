import { Router } from 'express';
import { getMethods } from '../controllers/application.controller';

const serviceRouter = Router();

serviceRouter.get('/methods', getMethods);

export default serviceRouter;
