process.env.ENABLE_NEW_JSX_TRANSFORM = 'true';
import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: '@commercetools-frontend/jest-preset-mc-app/typescript',
  setupFiles: ['./setup.ts'],
};

export default config;
