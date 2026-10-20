import nodeConfig from '@qa-3d/config/eslint/node';

export default [
  ...nodeConfig,
  {
    files: ['**/*.ts'],
  },
];
