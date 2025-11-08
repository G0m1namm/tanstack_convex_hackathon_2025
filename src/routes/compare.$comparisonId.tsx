import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/compare/$comparisonId')({
  loader: ({ params }) => ({
    comparisonId: params.comparisonId,
  }),
  beforeLoad: ({ params }) => {
    // Redirect to language-specific route
    throw redirect({
      to: '/en/compare/$comparisonId',
      params: { comparisonId: params.comparisonId },
      replace: true,
    })
  },
})

// Legacy component removed - now handled by language-specific routes
