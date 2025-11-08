// Test helpers for retry logic - extracted to avoid convex dependencies

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
}

// Generic retry function with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config = RETRY_CONFIG,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        console.log(`Non-retryable error in ${context}, not attempting retry:`, lastError.message)
        throw lastError
      }

      // If this was the last attempt, throw the error
      if (attempt === config.maxRetries) {
        console.error(`All ${config.maxRetries + 1} attempts failed for ${context}:`, lastError.message)
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      )

      console.warn(`Attempt ${attempt + 1} failed for ${context}, retrying in ${delay}ms:`, lastError.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError!
}

// Check if an error should not be retried
export function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  // Don't retry on authentication/configuration errors
  if (message.includes('api key') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid url')) {
    return true
  }

  // Don't retry on certain Firecrawl-specific errors
  if (message.includes('invalid url format') ||
      message.includes('missing required')) {
    return true
  }

  return false
}

// Classify extraction errors for better user messaging
export function classifyExtractionError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred while extracting product information.'
  }

  const message = error.message.toLowerCase()

  // Timeout errors
  if (message.includes('timeout') || message.includes('etimedout')) {
    return 'The product page took too long to load. This might happen with slow websites or during high traffic. Please try again later.'
  }

  // Network/connectivity errors
  if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
    return 'Unable to connect to the website. Please check the URL and try again.'
  }

  // Authentication/configuration errors
  if (message.includes('api key') || message.includes('unauthorized')) {
    return 'Service temporarily unavailable. Please try again later.'
  }

  // URL validation errors
  if (message.includes('invalid url') || message.includes('malformed')) {
    return 'The provided URL appears to be invalid. Please check the URL and try again.'
  }

  // Content extraction errors
  if (message.includes('no data') || message.includes('failed to extract')) {
    return 'Unable to extract product information from this page. The page might not be a product page or may have an unusual format.'
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many requests. Please wait a moment and try again.'
  }

  // Default fallback
  return 'Unable to analyze this product page. Please try a different URL or try again later.'
}

// Classify search errors for better user messaging
export function classifySearchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred while searching for similar products.'
  }

  const message = error.message.toLowerCase()

  // Timeout errors
  if (message.includes('timeout') || message.includes('etimedout')) {
    return 'The search took too long to complete. Please try again later.'
  }

  // Network/connectivity errors
  if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
    return 'Unable to connect to search services. Please try again later.'
  }

  // Authentication/configuration errors
  if (message.includes('api key') || message.includes('unauthorized')) {
    return 'Search service temporarily unavailable. Please try again later.'
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many search requests. Please wait a moment and try again.'
  }

  // Content/search errors
  if (message.includes('no results') || message.includes('empty')) {
    return 'No similar products found. This might be normal for unique or specialized items.'
  }

  // Default fallback
  return 'Unable to search for similar products. Please try again later.'
}
