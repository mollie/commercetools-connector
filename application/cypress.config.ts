import path from 'path';
import { defineConfig } from 'cypress';
import { customApplicationConfig } from '@commercetools-frontend/cypress/task';

export default defineConfig({
  retries: 1,
  video: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, cypressConfig) {
      // Load the config
      if (!process.env.CI) {
        const envPath = path.join(__dirname, 'cypress/.env');
        console.log('Loading environment variables from', envPath);
        const dotenv = await import('dotenv');
        dotenv.config({ path: envPath });
      }

      on('task', { customApplicationConfig });
      // on('task', { customViewConfig });
      return {
        ...cypressConfig,
        env: {
          ...cypressConfig.env,
          LOGIN_USER: process.env.CYPRESS_LOGIN_USER,
          LOGIN_PASSWORD: process.env.CYPRESS_LOGIN_PASSWORD,
          PROJECT_KEY: process.env.CYPRESS_PROJECT_KEY,
          PACKAGE_NAME: process.env.CYPRESS_PACKAGE_NAME,
        },
      };
    },
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3001',
  },
});
