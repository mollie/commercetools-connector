module.exports = {
  displayName: 'Tests Typescript Application - shopmacher-mollie-processor',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/tests/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/src/jest.setup.ts'],
};
