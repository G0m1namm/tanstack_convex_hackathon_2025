import { createFileRoute } from '@tanstack/react-router'
import { SearchPage } from '../components/SearchPage'

export const Route = createFileRoute('/$lang/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || '',
    searchId: (search.searchId as string) || '',
  }),
  component: SearchPageWrapper,
})

function SearchPageWrapper() {
  const { url, searchId } = Route.useSearch()
  return <SearchPage url={url} searchId={searchId} />
}