import tsParser from '@typescript-eslint/parser'
import testA11y from 'eslint-plugin-test-a11y-js'

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'test-a11y-js': testA11y,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: testA11y.configs['flat/react'].rules,
  },
]
