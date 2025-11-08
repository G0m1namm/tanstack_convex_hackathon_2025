import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    url: (search.url as string) || '',
    searchId: (search.searchId as string) || '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { url, searchId } = Route.useSearch()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'extracting' | 'searching' | 'completed' | 'error'>('extracting')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')

  const extractProductFromUrl = useAction(api.search.extractProductFromUrl)
  const searchSimilarProducts = useAction(api.search.searchSimilarProducts)
  const createComparison = useAction(api.search.createComparison)

  useEffect(() => {
    if (!url) {
      navigate({ to: '/' })
      return
    }

    startSearchProcess()
  }, [url])

  const startSearchProcess = async () => {
    try {
      // Step 1: Extract product from URL
      setStatus('extracting')
      setProgress(25)

      const extractionResult = await extractProductFromUrl({
        url,
        searchId: searchId ? searchId as any : undefined,
      })

      setProgress(50)

      // Step 2: Create comparison session
      const comparisonId = await createComparison({
        originalProductId: extractionResult.productId,
        searchQuery: extractionResult.searchQuery,
      })

      setProgress(75)
      setStatus('searching')

      // Step 3: Search for similar products
      await searchSimilarProducts({
        searchQuery: extractionResult.searchQuery,
        originalPlatform: extractionResult.platform,
        comparisonId,
      })

      setProgress(100)
      setStatus('completed')

      // Navigate to results
      setTimeout(() => {
        navigate({
          to: '/compare/$comparisonId',
          params: { comparisonId },
        })
      }, 1000)

    } catch (err) {
      console.error('Search process failed:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const steps = [
    { key: 'extracting', label: 'Extracting product details', icon: '🔍' },
    { key: 'searching', label: 'Finding alternatives', icon: '🛒' },
    { key: 'completed', label: 'Comparison ready', icon: '✅' },
  ]

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'extracting': return 0
      case 'searching': return 1
      case 'completed': return 2
      default: return 0
    }
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Finding Better Deals</h1>
          <p className="text-gray-600">
            Analyzing <span className="font-medium text-indigo-600">{url}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">{progress}% complete</p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const currentStepIndex = getCurrentStepIndex()
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isPending = index > currentStepIndex

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : isCurrent
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-2xl ${isCompleted ? 'animate-bounce' : ''}`}>
                  {isCompleted ? '✅' : isCurrent ? step.icon : '⏳'}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted
                      ? 'text-green-800'
                      : isCurrent
                      ? 'text-indigo-800'
                      : 'text-gray-600'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && status === 'extracting' && (
                    <p className="text-sm text-gray-500 mt-1">Using AI to analyze the product...</p>
                  )}
                  {isCurrent && status === 'searching' && (
                    <p className="text-sm text-gray-500 mt-1">Searching across multiple platforms...</p>
                  )}
                  {isCompleted && (
                    <p className="text-sm text-green-600 mt-1">Completed successfully</p>
                  )}
                </div>
                {isCurrent && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• We search Amazon, eBay, Walmart, Best Buy, and Target</li>
            <li>• Results are sorted by lowest price first</li>
            <li>• Click "Visit Store" to purchase directly</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to search
          </button>
        </div>
      </div>
    </div>
  )
}
