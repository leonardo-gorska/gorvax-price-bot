import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'warn',
      'no-useless-escape': 'off',
      'no-empty': 'warn',
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'data/', '*.js'],
  }
);
