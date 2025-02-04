jest.mock('../src/utils/logger.utils.ts', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    level: 'debug',
  },
}));
