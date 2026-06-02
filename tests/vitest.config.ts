import { defineConfig } from 'vitest/config';
import path from 'path';

const testsDir = __dirname;

export default defineConfig({
  root: testsDir,
  test: {
    include: ['unit/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(testsDir, '../src'),
    },
  },
});
