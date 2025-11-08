import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig([
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js builtins and external libraries
            ['^node:', '^@?\\w'],
            // Internal packages with @ alias
            ['^@/'],
            // Internal packages with ~ alias
            ['^~/'],
            // Parent imports
            ['^\\.\\./'],
            // Relative imports
            ['^\\./'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  globalIgnores(['convex/_generated']),
])
