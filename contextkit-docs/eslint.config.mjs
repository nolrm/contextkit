import tsParser from '@typescript-eslint/parser'
import a11y from 'eslint-plugin-a11y'

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      a11y,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: a11y.configs['flat/react'].rules,
  },
]
