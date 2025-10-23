module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-plugin-n8n-nodes-base/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
