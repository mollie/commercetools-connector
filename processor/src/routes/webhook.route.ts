import { Router } from 'express';
import { post } from '../controllers/webhook.controller';

const webhookRouter: Router = Router();

webhookRouter.get('/health-check', async (req, res) => {
  res.status(200).send('Webhook is running');
});

webhookRouter.post('/', post);

export default webhookRouter;
