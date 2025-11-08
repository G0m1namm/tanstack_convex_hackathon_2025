import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { useAction, useMutation } from 'convex/react'
import { Trans } from '@lingui/react'
import { AlertCircle, CheckCircle2, Clock, Zap, Search } from 'lucide-react'

import { api } from '../../convex/_generated/api'
import { Progress } from './ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

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
  const params = useParams({ strict: false })
  const [status, setStatus] = useState<
    'extracting' | 'searching' | 'completed' | 'error' | 'timeout_warning'
  >('extracting')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [errorType, setErrorType] = useState<ErrorType>('unknown')
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 1,
    maxRetries: 3,
    isRetrying: false,
    nextRetryIn: 0,
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

    if (
      message.includes('timeout') ||
      message.includes('etimedout') ||
      message.includes('scrape timed out')
    ) {
      return 'timeout'
    }
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('econnrefused')
    ) {
      return 'network'
    }
    if (message.includes('invalid url') || message.includes('malformed')) {
      return 'invalid_url'
    }
    if (
      message.includes('rate limit') ||
      message.includes('too many requests')
    ) {
      return 'rate_limit'
    }
    if (
      message.includes('no data') ||
      message.includes('failed to extract') ||
      message.includes('unable to analyze')
    ) {
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
        setRetryState((prev) => ({ ...prev, attempt, isRetrying: false }))

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
          searchId: searchId ? (searchId as any) : undefined,
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
        setRetryState((prev) => ({
          ...prev,
          attempt: attempt + 1,
          isRetrying: true,
          nextRetryIn: getRetryDelay(attempt + 1) / 1000,
        }))

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, getRetryDelay(attempt)),
        )
      }
    }

    throw lastError!
  }, [
    url,
    searchId,
    retryState.maxRetries,
    extractProductFromUrl,
    classifyError,
    getRetryDelay,
    timeoutWarningShown,
  ])

  // Manual retry function
  const retrySearch = useCallback(() => {
    setStatus('extracting')
    setProgress(0)
    setError('')
    setErrorType('unknown')
    setRetryState((prev) => ({ ...prev, attempt: 1, isRetrying: false }))
    setTimeoutWarningShown(false)
    setRetryCountdown(0)
    startSearchProcess()
  }, [])

  // Countdown timer for retry delays
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (retryState.isRetrying && retryCountdown > 0) {
      interval = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            setRetryState((prevState) => ({ ...prevState, isRetrying: false }))
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
      navigate({ to: '/$lang', params: { lang: params.lang || 'en' } })
      return
    }

    startSearchProcess()
  }, [url, params.lang])

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
          params: { lang: params.lang || 'en', comparisonId },
        })
      }, 1000)
    } catch (err) {
      console.error('Search process failed:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setErrorType(classifyError(err))
    }
  }, [
    extractWithRetry,
    createComparison,
    searchSimilarProducts,
    navigate,
    classifyError,
  ])

  const steps = [
    { key: 'extracting', label: 'Extracting product details', icon: '🔍' },
    { key: 'searching', label: 'Finding alternatives', icon: '🛒' },
    { key: 'completed', label: 'Comparison ready', icon: '✅' },
  ]

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'extracting':
      case 'timeout_warning':
        return 0
      case 'searching':
        return 1
      case 'completed':
        return 2
      default:
        return 0
    }
  }

  // Get error-specific styling and actions
  const getErrorConfig = (errorType: ErrorType) => {
    switch (errorType) {
      case 'timeout':
        return {
          icon: Clock,
          title: 'Taking Longer Than Expected',
          description:
            'The website is slow to respond. This sometimes happens during peak hours.',
          canRetry: true,
          showDifferentUrl: true,
        }
      case 'network':
        return {
          icon: AlertCircle,
          title: 'Connection Issue',
          description:
            'Unable to connect to the website. Please check your internet connection.',
          canRetry: true,
          showDifferentUrl: true,
        }
      case 'invalid_url':
        return {
          icon: AlertCircle,
          title: 'Invalid URL',
          description:
            'The provided URL appears to be invalid or not supported.',
          canRetry: false,
          showDifferentUrl: true,
        }
      case 'rate_limit':
        return {
          icon: Clock,
          title: 'Too Many Requests',
          description:
            "We're receiving too many requests. Please wait a moment before trying again.",
          canRetry: true,
          showDifferentUrl: false,
        }
      case 'extraction_failed':
        return {
          icon: Search,
          title: 'Unable to Analyze Page',
          description:
            'This page might not be a product page or may have an unusual format.',
          canRetry: false,
          showDifferentUrl: true,
        }
      default:
        return {
          icon: AlertCircle,
          title: 'Search Failed',
          description: 'Something unexpected happened. Please try again.',
          canRetry: true,
          showDifferentUrl: true,
        }
    }
  }

  if (status === 'error') {
    const errorConfig = getErrorConfig(errorType)
    const IconComponent = errorConfig.icon
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-border shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <IconComponent
                className="w-16 h-16 text-primary"
                strokeWidth={1.5}
              />
            </div>
            <CardTitle className="text-2xl text-foreground">
              {errorConfig.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{errorConfig.description}</p>
            <Alert
              variant="destructive"
              className="bg-rose-50 border-rose-300 text-rose-900"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="text-rose-700">{error}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              {errorConfig.canRetry && (
                <Button
                  onClick={retrySearch}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Trans id="search.tryAgain" />
                </Button>
              )}
              {errorConfig.showDifferentUrl && (
                <Button
                  onClick={() =>
                    navigate({
                      to: '/$lang',
                      params: { lang: params.lang || 'en' },
                    })
                  }
                  variant={errorConfig.canRetry ? 'secondary' : 'default'}
                  className="w-full"
                >
                  <Trans id="search.tryDifferentUrl" />
                </Button>
              )}
            </div>

            {/* Retry attempts info */}
            {retryState.attempt > 1 && (
              <Alert className="bg-secondary border-border">
                <AlertDescription className="text-muted-foreground">
                  <Trans
                    id="search.attemptsInfo"
                    values={{
                      attempt: retryState.attempt,
                      maxRetries: retryState.maxRetries,
                    }}
                  />
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Timeout warning overlay
  if (status === 'timeout_warning') {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-background">
        {/* Main content (slightly dimmed) */}
        <div className="opacity-40">
          {/* Include the main search UI here */}
          <div className="max-w-2xl w-full bg-card rounded-lg shadow-xl p-8 border border-border/50">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Finding Better Deals
              </h1>
              <p className="text-muted-foreground">
                Analyzing{' '}
                <span className="font-medium text-foreground">{url}</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progress} className="h-3" />
              <p className="text-center text-sm text-muted-foreground mt-2">
                {progress}% complete
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                <Spinner className="h-6 w-6" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Extracting product details (Attempt {retryState.attempt}/
                    {retryState.maxRetries})
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is taking longer than usual...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card className="border-amber-300 bg-white shadow-xl p-6 max-w-sm w-full text-center">
            <CardContent className="pt-0">
              <div className="flex justify-center mb-3">
                <Clock
                  className="w-10 h-10 text-amber-600"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Taking Longer Than Expected
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                The website is slow to respond. Would you like to wait or try a
                different approach?
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setStatus('extracting')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Keep Waiting
                </Button>
                <Button
                  onClick={() =>
                    navigate({
                      to: '/$lang',
                      params: { lang: params.lang || 'en' },
                    })
                  }
                  variant="secondary"
                  className="w-full"
                >
                  Try Different URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full bg-card rounded-lg shadow-xl p-8 border border-border">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Finding Better Deals
          </h1>
          <p className="text-muted-foreground">
            Analyzing <span className="font-medium text-foreground">{url}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-sm text-muted-foreground mt-2">
            {progress}% complete
          </p>
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
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all border ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300'
                    : isCurrent
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-secondary border-border'
                }`}
              >
                <div
                  className={`shrink-0 ${isCompleted ? 'animate-bounce' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      className="w-6 h-6 text-emerald-600"
                      strokeWidth={1.5}
                    />
                  ) : isCurrent ? (
                    <Zap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  ) : (
                    <Clock
                      className="w-6 h-6 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                    {isCurrent &&
                      status === 'extracting' &&
                      retryState.attempt > 1 && (
                        <span className="text-sm font-normal ml-2">
                          (Attempt {retryState.attempt}/{retryState.maxRetries})
                        </span>
                      )}
                  </p>
                  {isCurrent &&
                    status === 'extracting' &&
                    retryState.isRetrying && (
                      <p className="text-sm text-amber-600 mt-1">
                        Previous attempt failed, retrying in {retryCountdown}
                        s...
                      </p>
                    )}
                  {isCurrent &&
                    status === 'extracting' &&
                    !retryState.isRetrying && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {retryState.attempt > 1
                          ? `Retrying extraction (attempt ${retryState.attempt})...`
                          : 'Using AI to analyze the product...'}
                      </p>
                    )}
                  {isCurrent && status === 'searching' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Searching across multiple platforms...
                    </p>
                  )}
                  {isCompleted && (
                    <p className="text-sm text-emerald-600 mt-1">
                      Completed successfully
                    </p>
                  )}
                </div>
                {isCurrent && <Spinner className="h-6 w-6" />}
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h3 className="font-medium mb-2 text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
            Pro Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• We search Amazon, eBay, Walmart, Best Buy, and Target</li>
            <li>• Results are sorted by lowest price first</li>
            <li>• Click "Visit Store" to purchase directly</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={() =>
              navigate({ to: '/$lang', params: { lang: params.lang || 'en' } })
            }
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to search
          </Button>
        </div>
      </div>
    </div>
  )
}
