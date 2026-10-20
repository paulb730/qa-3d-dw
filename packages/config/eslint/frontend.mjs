import baseConfig from './base.mjs';
import globals from 'globals';

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },
  {
    rules: {
      'no-console': 'warn', // En frontend, console.log debe evitarse
    },
  },
];
