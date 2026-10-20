import frontendConfig from '@qa-3d/config/eslint/frontend';

export default [
  ...frontendConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
  },
];
