import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  globalSetup: './.jest/setup.ts',
  setupFilesAfterEnv: ['./.jest/setupFilesAfterEnv.ts'],
  globalTeardown: './.jest/teardown.ts',
  testEnvironment: './.jest/environment.ts',
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  setupFiles: ['./.jest/setEnvVars.js'],
  globals: {
    localPath: 'global.localPath',
  },
};

export default config;
