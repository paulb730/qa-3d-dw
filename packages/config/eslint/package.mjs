import baseConfig from './base.mjs';

export default [
  ...baseConfig,
  {
    rules: {
      // Paquetes compartidos deben ser más estrictos
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
