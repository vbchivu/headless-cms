module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended', // ⬅️ Adds prettier and turns off conflicting ESLint rules
    ],
    rules: {
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'prettier/prettier': 'warn' // ⬅️ Show Prettier issues as ESLint warnings
    },
    ignorePatterns: ['dist/', 'node_modules/'],
};
