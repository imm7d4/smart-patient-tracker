const googleConfig = require('eslint-config-google');

module.exports = [
  {
    ignores: ['node_modules', '*.log', '.env', 'dist', 'build', 'coverage'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        console: 'readonly',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
      },
    },
    rules: {
      // Google style guide base rules
      ...googleConfig.rules,

      // Relax JSDoc requirements
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',

      // Relax line length for readability
      'max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],

      // Allow unused vars with underscore prefix
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // Allow Express Router pattern (const router = express.Router())
      'new-cap': ['error', {
        capIsNewExceptions: ['Router'],
      }],
    },
  },
];
