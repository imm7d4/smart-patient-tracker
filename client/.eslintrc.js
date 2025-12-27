module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react', 'react-hooks', 'import'],
    rules: {
        // Start relaxed, will tighten in Phase 2
        'no-console': 'warn',
        'prefer-const': 'warn',
        'no-unused-vars': 'warn',
        'react/prop-types': 'off', // Will enforce with TypeScript later
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
