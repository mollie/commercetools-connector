import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import { updatePaymentExtensionAccessToken } from '../service/job.service';

// Create the router for our app
const jobRouter: Router = Router();

jobRouter.post('/', async (req, res, next) => {
  try {
    await updatePaymentExtensionAccessToken();

    res.status(200).send();
  } catch (error) {
    logger.error('SCTM - job - Error in job route', error);
    next(error);
  }
});

export default jobRouter;
