module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
  plugins: ['prettier', 'react', 'react-native'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      presets: ['babel-preset-expo'],
    },
  },
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  rules: {
    'prettier/prettier': 'warn',
    'react/react-in-jsx-scope': 'warn',
    'react/prop-types': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'no-unused-vars': 'warn',
    'no-shadow': 'warn',
    'no-undef': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-duplicate-imports': 'warn',
    'no-dupe-keys': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
