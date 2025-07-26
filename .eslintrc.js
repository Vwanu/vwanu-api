module.exports = {
  root: true,
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 13,
  },
  plugins: ['@typescript-eslint', 'jest'],
  // TODO: Fix ignorePatterns to make sure promises ae handled correctly
  ignorePatterns: ['.eslintrc.js', 'src/**/*.spec.ts'],
  overrides: [
    {
      extends: ['plugin:deprecation/recommended'],
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 13,
        project: ['./tsconfig.json'],
      },
      plugins: ['deprecation'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^(_|event|context|body|identity)',
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
          },
        ],
        '@typescript-eslint/ban-ts-comment': ['off'],
        '@typescript-eslint/await-thenable': ['error'],
        '@typescript-eslint/no-floating-promises': ['error'],
        '@typescript-eslint/no-misused-promises': ['error'],
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          { prefer: 'no-type-imports' },
        ],
      },
    },
    {
      files: ['**.spec.ts'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: { 'jest/prefer-expect-assertions': 'off' },
    },
  ],
};
