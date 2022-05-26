const path = require('path');

module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    tsconfigRootDir: path.resolve(__dirname),
    ecmaVersion: 2018,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['@typescript-eslint', 'vue'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-async-promise-executor': 0,
    'no-prototype-builtins': 0,
    'vue/max-attributes-per-line': 0,
    'vue/no-v-html': 0,
    'vue/html-self-closing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/html-indent': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
  },
  globals: {
    NodeJS: false,
    DEVELOPMENT: false,
    nodeRequire: false,
  },
};
