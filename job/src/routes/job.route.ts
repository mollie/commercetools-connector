import { Router } from 'express';

import { post } from '../controllers/job.controller';
import { logger } from '../utils/logger.utils';

// Create the router for our app
const jobRouter: Router = Router();

jobRouter.post('/', async (req, res, next) => {
  try {
    await post(req, res);
  } catch (error) {
    logger.error('SCTM - job - Error in job route', error);
    next(error);
  }
});

export default jobRouter;
