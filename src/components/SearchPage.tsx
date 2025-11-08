import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { useAction, useMutation } from 'convex/react'
import { useLingui } from '@lingui/react'

import { api } from '../../convex/_generated/api'

type ErrorType = 'timeout' | 'network' | 'invalid_url' | 'rate_limit' | 'extraction_failed' | 'unknown'

interface RetryState {
  attempt: number
  maxRetries: number
  isRetrying: boolean
  nextRetryIn: number
}

interface SearchPageProps {
  url: string
  searchId: string
}

export function SearchPage({ url, searchId }: SearchPageProps) {
  const navigate = useNavigate()
  const { t } = useLingui()
  const [status, setStatus] = useState<'extracting' | 'searching' | 'completed' | 'error' | 'timeout_warning'>('extracting')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [errorType, setErrorType] = useState<ErrorType>('unknown')
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 1,
    maxRetries: 3,
    isRetrying: false,
    nextRetryIn: 0
  })
  const [timeoutWarningShown, setTimeoutWarningShown] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)

  const extractProductFromUrl = useAction(
    api.firecrawlActions.extractProductFromUrl,
  )
  const searchSimilarProducts = useAction(
    api.firecrawlActions.searchSimilarProducts,
  )
  const createComparison = useMutation(api.search.createComparison)

  // Classify error type from error message
  const classifyError = useCallback((error: unknown): ErrorType => {
    if (!(error instanceof Error)) return 'unknown'

    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('etimedout') || message.includes('scrape timed out')) {
      return 'timeout'
    }
    if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
      return 'network'
    }
    if (message.includes('invalid url') || message.includes('malformed')) {
      return 'invalid_url'
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limit'
    }
    if (message.includes('no data') || message.includes('failed to extract') || message.includes('unable to analyze')) {
      return 'extraction_failed'
    }

    return 'unknown'
  }, [])

  // Calculate retry delay with exponential backoff
  const getRetryDelay = useCallback((attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000) // 1s, 2s, 4s, max 10s
  }, [])

  // Handle extraction with frontend retry logic
  const extractWithRetry = useCallback(async (): Promise<any> => {
    let lastError: Error

    for (let attempt = 1; attempt <= retryState.maxRetries; attempt++) {
      let timeoutWarningId: NodeJS.Timeout | undefined

      try {
        setRetryState(prev => ({ ...prev, attempt, isRetrying: false }))

        // Set a timeout warning after 30 seconds
        const timeoutPromise = new Promise<never>((_resolve, _reject) => {
          timeoutWarningId = setTimeout(() => {
            if (!timeoutWarningShown) {
              setTimeoutWarningShown(true)
              setStatus('timeout_warning')
            }
            // Don't reject here - let the extraction continue
          }, 30000)
        })

        const extractionPromise = extractProductFromUrl({
          url,
          searchId: searchId ? searchId as any : undefined,
        })

        const result = await Promise.race([extractionPromise, timeoutPromise])

        if (timeoutWarningId) clearTimeout(timeoutWarningId)
        setTimeoutWarningShown(false)
        return result

      } catch (err) {
        if (timeoutWarningId) clearTimeout(timeoutWarningId)
        lastError = err instanceof Error ? err : new Error(String(err))

        const errorType = classifyError(lastError)
        setErrorType(errorType)

        // Don't retry on certain errors
        if (['invalid_url', 'rate_limit'].includes(errorType)) {
          throw lastError
        }

        // If this was the last attempt, throw the error
        if (attempt === retryState.maxRetries) {
          throw lastError
        }

        // Show retry state
        setRetryState(prev => ({
          ...prev,
          attempt: attempt + 1,
          isRetrying: true,
          nextRetryIn: getRetryDelay(attempt + 1) / 1000
        }))

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)))
      }
    }

    throw lastError!
  }, [url, searchId, retryState.maxRetries, extractProductFromUrl, classifyError, getRetryDelay, timeoutWarningShown])

  // Manual retry function
  const retrySearch = useCallback(() => {
    setStatus('extracting')
    setProgress(0)
    setError('')
    setErrorType('unknown')
    setRetryState(prev => ({ ...prev, attempt: 1, isRetrying: false }))
    setTimeoutWarningShown(false)
    setRetryCountdown(0)
    startSearchProcess()
  }, [])

  // Countdown timer for retry delays
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (retryState.isRetrying && retryCountdown > 0) {
      interval = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            setRetryState(prevState => ({ ...prevState, isRetrying: false }))
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [retryState.isRetrying, retryCountdown])

  // Update countdown when retry state changes
  useEffect(() => {
    if (retryState.isRetrying) {
      setRetryCountdown(retryState.nextRetryIn)
    }
  }, [retryState.isRetrying, retryState.nextRetryIn])

  useEffect(() => {
    if (!url) {
      navigate({ to: '/$lang' })
      return
    }

    startSearchProcess()
  }, [url])

  const startSearchProcess = useCallback(async () => {
    try {
      // Step 1: Extract product from URL with retry logic
      setStatus('extracting')
      setProgress(10)

      const extractionResult = await extractWithRetry()

      setProgress(40)

      // Step 2: Create comparison session
      const comparisonId = await createComparison({
        originalProductId: extractionResult.productId,
        searchQuery: extractionResult.searchQuery,
      })

      setProgress(60)
      setStatus('searching')

      // Step 3: Search for similar products
      await searchSimilarProducts({
        searchQuery: extractionResult.searchQuery,
        originalPlatform: extractionResult.platform,
        comparisonId,
      })

      setProgress(100)
      setStatus('completed')

      // Navigate to results (even if no alternatives found, show the original product)
      setTimeout(() => {
        navigate({
          to: '/$lang/compare/$comparisonId',
          params: { comparisonId },
        })
      }, 1000)

    } catch (err) {
      console.error('Search process failed:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setErrorType(classifyError(err))
    }
  }, [extractWithRetry, createComparison, searchSimilarProducts, navigate, classifyError])

  const steps = [
    { key: 'extracting', label: 'Extracting product details', icon: '🔍' },
    { key: 'searching', label: 'Finding alternatives', icon: '🛒' },
    { key: 'completed', label: 'Comparison ready', icon: '✅' },
  ]

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'extracting':
      case 'timeout_warning': return 0
      case 'searching': return 1
      case 'completed': return 2
      default: return 0
    }
  }

  // Get error-specific styling and actions
  const getErrorConfig = (errorType: ErrorType) => {
    switch (errorType) {
      case 'timeout':
        return {
          icon: '⏰',
          title: t({ id: 'search.errors.timeout.title', message: 'Taking Longer Than Expected' }),
          description: t({ id: 'search.errors.timeout.description', message: 'The website is slow to respond. This sometimes happens during peak hours.' }),
          canRetry: true,
          showDifferentUrl: true
        }
      case 'network':
        return {
          icon: '🌐',
          title: t({ id: 'search.errors.network.title', message: 'Connection Issue' }),
          description: t({ id: 'search.errors.network.description', message: 'Unable to connect to the website. Please check your internet connection.' }),
          canRetry: true,
          showDifferentUrl: true
        }
      case 'invalid_url':
        return {
          icon: '❌',
          title: t({ id: 'search.errors.invalidUrl.title', message: 'Invalid URL' }),
          description: t({ id: 'search.errors.invalidUrl.description', message: 'The provided URL appears to be invalid or not supported.' }),
          canRetry: false,
          showDifferentUrl: true
        }
      case 'rate_limit':
        return {
          icon: '🐌',
          title: t({ id: 'search.errors.rateLimit.title', message: 'Too Many Requests' }),
          description: t({ id: 'search.errors.rateLimit.description', message: 'We\'re receiving too many requests. Please wait a moment before trying again.' }),
          canRetry: true,
          showDifferentUrl: false
        }
      case 'extraction_failed':
        return {
          icon: '🔍',
          title: t({ id: 'search.errors.extractionFailed.title', message: 'Unable to Analyze Page' }),
          description: t({ id: 'search.errors.extractionFailed.description', message: 'This page might not be a product page or may have an unusual format.' }),
          canRetry: false,
          showDifferentUrl: true
        }
      default:
        return {
          icon: '❌',
          title: t({ id: 'search.errors.unknown.title', message: 'Search Failed' }),
          description: t({ id: 'search.errors.unknown.description', message: 'Something unexpected happened. Please try again.' }),
          canRetry: true,
          showDifferentUrl: true
        }
    }
  }

  if (status === 'error') {
    const errorConfig = getErrorConfig(errorType)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">{errorConfig.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{errorConfig.title}</h2>
          <p className="text-gray-600 mb-4">{errorConfig.description}</p>
          <p className="text-sm text-gray-500 mb-6">{error}</p>

          <div className="space-y-3">
            {errorConfig.canRetry && (
              <button
                onClick={retrySearch}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
<Trans id="search.tryAgain" />
              </button>
            )}
            {errorConfig.showDifferentUrl && (
              <button
                onClick={() => navigate({ to: '/$lang' })}
                className={`w-full px-6 py-3 rounded-lg transition-colors ${
                  errorConfig.canRetry
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
<Trans id="search.tryDifferentUrl" />
              </button>
            )}
          </div>

          {/* Retry attempts info */}
          {retryState.attempt > 1 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
<Trans id="search.attemptsInfo" values={{ attempt: retryState.attempt, maxRetries: retryState.maxRetries }} />
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Timeout warning overlay
  if (status === 'timeout_warning') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
        {/* Main content (slightly dimmed) */}
        <div className="opacity-50">
          {/* Include the main search UI here */}
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
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <div className="flex-1">
                  <p className="font-medium text-indigo-800">
                    Extracting product details (Attempt {retryState.attempt}/{retryState.maxRetries})
                  </p>
                  <p className="text-sm text-gray-500 mt-1">This is taking longer than usual...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Taking Longer Than Expected</h3>
            <p className="text-sm text-yellow-700 mb-4">
              The website is slow to respond. Would you like to wait or try a different approach?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setStatus('extracting')} // Continue waiting
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Keep Waiting
              </button>
              <button
                onClick={() => navigate({ to: '/$lang' })}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Try Different URL
              </button>
            </div>
          </div>
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
                    {isCurrent && status === 'extracting' && retryState.attempt > 1 && (
                      <span className="text-sm font-normal ml-2">
                        (Attempt {retryState.attempt}/{retryState.maxRetries})
                      </span>
                    )}
                  </p>
                  {isCurrent && status === 'extracting' && retryState.isRetrying && (
                    <p className="text-sm text-orange-600 mt-1">
                      Previous attempt failed, retrying in {retryCountdown}s...
                    </p>
                  )}
                  {isCurrent && status === 'extracting' && !retryState.isRetrying && (
                    <p className="text-sm text-gray-500 mt-1">
                      {retryState.attempt > 1
                        ? `Retrying extraction (attempt ${retryState.attempt})...`
                        : 'Using AI to analyze the product...'
                      }
                    </p>
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
            onClick={() => navigate({ to: '/$lang' })}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to search
          </button>
        </div>
      </div>
    </div>
  )
}
