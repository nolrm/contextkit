const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Existing codebase does not use the Error cause pattern — disable to avoid noise
      'preserve-caught-error': 'off',
    },
  },
  {
    files: ['__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // Tests mock require() by reassigning the global — allow this pattern in tests
      'no-global-assign': 'off',
    },
  },
];
