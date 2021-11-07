module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['prettier', 'plugin:prettier/recommended', 'airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    window: true,
    document: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'operator-linebreak': 0,
    'implicit-arrow-linebreak': 0,
    'no-implicit-globals': 2,
    'no-restricted-globals': 2,
    'object-curly-spacing': 0,
    'object-curly-newline': 0,
    'function-paren-newline': 0,
    'arrow-parens': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': ['error', {argsIgnorePattern: 'next'}],
    'no-use-before-define': ['error', {variables: false}],
    'no-multi-str': 0,
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        jsxSingleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
        arrowParens: 'avoid',
        rangeStart: 0,
        requirePragma: false,
        insertPragma: false,
        proseWrap: 'always',
      },
    ],
  },
};
