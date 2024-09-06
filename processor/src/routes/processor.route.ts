import { Router } from 'express';
import { post, installation, uninstallation } from '../controllers/processor.controller';

const serviceRouter = Router();

serviceRouter.get('/health-check', async (req, res) => {
  res.status(200).send('Mollie processor is successfully running');
});

serviceRouter.post('/', post);

serviceRouter.post('/install', installation);

serviceRouter.post('/uninstall', uninstallation);

export default serviceRouter;
