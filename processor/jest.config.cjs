module.exports = {
  displayName: 'Tests Mollie connector - shopmacher-mollie-connector',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/jest.setupAfterEnv.ts'],
  modulePathIgnorePatterns: ['<rootDir>/src/jest.setup.ts'],
  reporters: ['default', 'jest-junit'],
};
