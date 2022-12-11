import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  testMatch: ['<rootDir>/src/**/test/*.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  },
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '@auth/(.*)': ['<rootDir>/src/features/auth/$1'],
    '@users/(.*)': ['<rootDir>/src/features/users/$1'],
    '@globals/(.*)': ['<rootDir>/src/shared/globals/$1'],
    '@services/(.*)': ['<rootDir>/src/shared/services/$1'],
    '@workers/(.*)': ['<rootDir>/src/shared/workers/$1'],
    '@root/(.*)': ['<rootDir>/src/$1']
  }
};

export default config;
