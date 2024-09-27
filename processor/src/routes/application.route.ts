import { Router } from 'express';
import { getMethods } from '../controllers/application.controller';

const serviceRouter = Router();

serviceRouter.post('/getMethods', getMethods);

export default serviceRouter;
