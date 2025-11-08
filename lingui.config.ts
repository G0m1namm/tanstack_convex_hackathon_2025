import { defineConfig } from '@lingui/cli'

export default defineConfig({
  locales: ['en', 'es'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/public/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
  compileNamespace: 'es',
  runtimeConfigModule: ['@lingui/core', 'i18n'],
})
