import { createFileRoute } from '@tanstack/react-router'
import { ComparisonPage } from '../components/ComparisonPage'

export const Route = createFileRoute('/$lang/compare/$comparisonId')({
  component: ComparisonPageWrapper,
})

function ComparisonPageWrapper() {
  const { comparisonId } = Route.useParams()
  return <ComparisonPage comparisonId={comparisonId} />
}
