import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || '',
    searchId: (search.searchId as string) || '',
  }),
  beforeLoad: ({ search }) => {
    // Redirect to language-specific route
    throw redirect({
      to: '/en/search',
      search,
      replace: true,
    })
  },
})

// Legacy component removed - now handled by language-specific routes
