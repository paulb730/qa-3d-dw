import packageConfig from '@qa-3d/config/eslint/package';

export default [
  ...packageConfig,
  {
    files: ['**/*.ts'],
  },
];
