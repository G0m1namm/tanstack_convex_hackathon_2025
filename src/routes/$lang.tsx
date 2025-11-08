import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { setSSRLanguage } from '../i18n'

export const Route = createFileRoute('/$lang')({
  loader: async ({ params }) => {
    // Validate language parameter
    const supportedLangs = ['en', 'es']
    if (!supportedLangs.includes(params.lang)) {
      throw redirect({
        to: '/$lang',
        params: { lang: 'en' },
        replace: true,
      })
    }

    // Set language for SSR
    await setSSRLanguage()
  },
  component: LangLayout,
})

function LangLayout() {
  return <Outlet />
}
