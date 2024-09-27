import * as dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import bodyParser from 'body-parser';

// Import routes
import ProcessorRoutes from './routes/processor.route';
import WebhookRoutes from './routes/webhook.route';
import ApplicationRoutes from './routes/application.route';

// Import logger
import { logger } from './utils/logger.utils';

import { readConfiguration } from './utils/config.utils';
import { errorMiddleware } from './middleware/error.middleware';
import { createSessionMiddleware, CLOUD_IDENTIFIERS } from '@commercetools-backend/express';

// Read env variables
readConfiguration();

const PORT = 8080;

// Create the express app
const app: Express = express();
app.disable('x-powered-by');

// Define configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.use('/processor', ProcessorRoutes);
app.use('/webhook', WebhookRoutes);
app.use('/application', ApplicationRoutes);

// Global error handler
app.use(errorMiddleware);
app.use(
  ['/application/*'],
  createSessionMiddleware({
    audience: `https://mc.${readConfiguration().commerceTools.region}.commercetools.com`,
    issuer: CLOUD_IDENTIFIERS.GCP_EU,
  }),
);

// Listen the application
const server = app.listen(PORT, () => {
  logger.info(`⚡️ Service application listening on port ${PORT}`);
});

export default server;
