import { Router } from 'express';
import { post } from '../controllers/processor.controller';

const serviceRouter = Router();

serviceRouter.get('/health-check', async (req, res) => {
  res.status(200).send('Mollie processor is successfully running');
});

serviceRouter.post('/', post);

export default serviceRouter;
