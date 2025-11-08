import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import * as Sentry from '@sentry/react'
import type { QueryClient } from '@tanstack/react-query'
import { I18nProvider } from '@lingui/react'
import { AlertCircle } from 'lucide-react'
import { i18n } from '~/i18n'
import { Navigation } from '~/components/Navigation'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import appCss from '~/styles/app.css?url'

Sentry.init({
  dsn: 'https://b1763bf55cffcc9c4b1876adafee316d@o4510321965596672.ingest.us.sentry.io/4510321967628288',
  sendDefaultPii: true,
  enabled: import.meta.env.MODE === 'production',
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'DealFinder - Find Cheaper Alternatives Instantly',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <I18nProvider i18n={i18n}>
        <Navigation />
        <Outlet />
      </I18nProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-border shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/">Go Back Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
