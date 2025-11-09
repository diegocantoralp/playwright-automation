module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'playwright'],
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'playwright/expect-expect': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/valid-expect': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'test-results/',
    'playwright-report/',
    '*.js'
  ],
};