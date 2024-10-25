module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['prettier'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/naming-convention': 'warn',
    'prettier/prettier': 'error',
    'tsdoc/syntax': 'warn',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      env: { es6: true, node: true },
      extends: ['plugin:@typescript-eslint/recommended'],
    },
  ],
  plugins: ['@typescript-eslint', 'prettier', 'eslint-plugin-tsdoc'],
}
