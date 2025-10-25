import { pathsToModuleNameMapper } from 'ts-jest';
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from './tsconfig.json';

export default {
  preset: 'ts-jest',
  // globalSetup: './src/testing/setup.global.ts',
  // globalTeardown: './src/testing/teardown.global.ts',
  // setupFilesAfterEnv: ['jest-extended/all', './src/testing/auto-mocks.ts'],
  testEnvironment: 'node',
  testTimeout: 30000,
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  coveragePathIgnorePatterns: ['node_modules', 'src/migration', 'src/testing'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  prettierPath: null,
};
