import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import googleConfig from 'eslint-config-google';

export default [
  {
    ignores: ['dist', 'node_modules', '*.config.js'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Google style guide base rules
      ...googleConfig.rules,

      // React-specific overrides
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Adjust for JSX
      'require-jsdoc': 'off', // Too strict for React components
      'valid-jsdoc': 'off',

      // Allow unused vars that start with underscore or are React components
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^_|^[A-Z]',
        argsIgnorePattern: '^_',
      }],

      // Relax line length for readability (Google default is 80)
      'max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
    },
  },
];
