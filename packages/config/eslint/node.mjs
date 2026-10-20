import baseConfig from './base.mjs';
import globals from 'globals';

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'no-console': 'off', // En backend, console.log es aceptable
    },
  },
];
