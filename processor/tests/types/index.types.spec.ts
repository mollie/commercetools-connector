import { describe, test, expect, jest } from '@jest/globals';
import { Message, ValidatorCreator, ValidatorFunction, Wrapper, ConnectorEnvVars } from '../../src/types/index.types';

const functions = {
  isMessage: jest.fn((obj: Message): obj is Message => {
    return typeof obj?.message === 'string' && typeof obj?.code === 'string' && typeof obj?.referencedBy === 'string';
  }),
  isValidatorCreator: jest.fn((obj: ValidatorCreator): obj is ValidatorCreator => {
    return typeof obj === 'object';
  }),
  isValidatorFunction: jest.fn((obj: ValidatorFunction): obj is ValidatorFunction => {
    return typeof obj === 'function';
  }),
  isWrapper: jest.fn((obj: Wrapper): obj is Wrapper => {
    return typeof obj === 'function';
  }),
  isConnectorEnvVars: jest.fn((obj: ConnectorEnvVars): obj is ConnectorEnvVars => {
    return typeof obj === 'object';
  }),
};

describe('Test index.types.ts', () => {
  test('should return the correct {Message} type declaration', () => {
    const mockType = {
      code: 'SCTM - Object CTP_CLIENT_ID not found',
      message: 'SCTM - Object CTP_CLIENT_ID not found',
      referencedBy: 'environmentVariables',
    } as unknown as Message;

    expect(functions.isMessage(mockType)).toBeTruthy();
  });

  test('should return the incorrect {Message} type declaration', () => {
    const mockType = {
      code: 'SCTM - Object CTP_CLIENT_ID not found',
    } as unknown as Message;

    expect(functions.isMessage(mockType)).toBeFalsy();
  });

  test('should return the correct {ValidatorCreator} type declaration', () => {
    const mockType = [
      ['./demo/path'],
      [
        [
          [jest.fn()],
          {
            code: 'InValidClientId',
            message: 'Client id should be 24 characters.',
            referencedBy: 'environmentVariables',
          },
          [{ max: 34, min: 2 }],
        ],
      ],
    ] as unknown as ValidatorCreator;

    expect(functions.isValidatorCreator(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ValidatorCreator} type declaration', () => {
    const mockType = 'Incorrect data type' as unknown as ValidatorCreator;
    expect(functions.isValidatorCreator(mockType)).toBeFalsy();
  });

  test('should return the correct {ValidatorFunction} type declaration', () => {
    const mockType = jest.fn(() => typeof 1 === 'number') as unknown as ValidatorFunction;
    expect(functions.isValidatorFunction(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ValidatorFunction} type declaration', () => {
    const mockType = 'Incorrect data type' as unknown as ValidatorFunction;
    expect(functions.isValidatorFunction(mockType)).toBeFalsy();
  });

  test('should return the correct {Wrapper} type declaration', () => {
    const mockType = jest.fn() as Wrapper;
    expect(functions.isWrapper(mockType)).toBeTruthy();
  });

  test('should return the incorrect {Wrapper} type declaration', () => {
    const mockType = 'Incorrect data type' as unknown as Wrapper;
    expect(functions.isWrapper(mockType)).toBeFalsy();
  });

  test('should return the correct {ConnectorEnvVars} type declaration', () => {
    const mockType = {
      CTP_CLIENT_ID: 'test',
      CTP_CLIENT_SECRET: 'test',
    } as unknown as ConnectorEnvVars;
    expect(functions.isConnectorEnvVars(mockType)).toBeTruthy();
  });

  test('should return the incorrect {ConnectorEnvVars} type declaration', () => {
    const mockType = 'Incorrect data type' as unknown as ConnectorEnvVars;
    expect(functions.isConnectorEnvVars(mockType)).toBeFalsy();
  });
});
