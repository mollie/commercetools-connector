module.exports = {
  displayName: 'Tests Typescript Application - Job',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setupAfterEnv.ts'],
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
};
