"use node"

// @ts-ignore - convex/values import may not be resolved in some environments
import { v } from 'convex/values'
import { action } from './_generated/server'
import type { ActionCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { api } from './_generated/api'
import { safeOptionalString, safeOptionalNumber } from '../__tests__/test-helpers/firecrawlHelpers'

// ===== FIRECRAWL ACTIONS (Node.js runtime) =====

// Firecrawl extraction schema for product data
const PRODUCT_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "The product title or name"
    },
    price: {
      type: "number",
      description: "Current selling price as a number"
    },
    currency: {
      type: "string",
      description: "Currency code (USD, EUR, etc.)",
      enum: ["USD", "EUR", "GBP", "CAD", "MXN"]
    },
    originalPrice: {
      type: "number",
      description: "Original price before discount (if different from current price)"
    },
    brand: {
      type: "string",
      description: "Product brand or manufacturer"
    },
    description: {
      type: "string",
      description: "Product description or details"
    },
    category: {
      type: "string",
      description: "Product category or department"
    },
    images: {
      type: "array",
      items: { type: "string" },
      description: "Array of image URLs for the product"
    },
    availability: {
      type: "boolean",
      description: "Whether the product is in stock and available for purchase"
    },
    platform: {
      type: "string",
      description: "E-commerce platform (amazon, ebay, walmart, bestbuy, target, mercadolibre)",
      enum: ["amazon", "ebay", "walmart", "bestbuy", "target", "mercadolibre"]
    }
  },
  required: ["name", "price", "currency", "platform", "availability"]
}

// ===== RETRY UTILITIES =====

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

  // Don't retry on certain extraction failures that indicate permanent issues
  if (message.includes('failed to extract product data') ||
      message.includes('missing required product information')) {
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
  if (message.includes('timeout') || message.includes('etimedout') || message.includes('scrape_timeout')) {
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

// Extract product data from URL using Firecrawl
type ExtractProductFromUrlArgs = {
  url: string
  searchId?: Id<'searches'>
}

type ExtractProductFromUrlResult = {
  productId: Id<'products'>
  name: string
  description?: string
  price: number
  currency: string
  originalPrice?: number
  platform: string
  imageUrl?: string
  brand?: string
  category?: string
  availability: boolean
  searchQuery: string
}

const extractProductFromUrlHandler = async (
  ctx: ActionCtx,
  args: ExtractProductFromUrlArgs,
): Promise<ExtractProductFromUrlResult> => {
  try {
    console.log('Extracting product from URL:', args.url)

    // Validate input
    if (!args.url || typeof args.url !== 'string') {
      throw new Error('Invalid URL provided')
    }

    // Basic URL validation
    try {
      new URL(args.url)
    } catch (urlError) {
      throw new Error('Invalid URL format')
    }

    // Check for API key
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error(
        'Firecrawl API key not configured. Please set FIRECRAWL_API_KEY environment variable.',
      )
    }

    // Initialize Firecrawl client
    // @ts-ignore - @mendable/firecrawl-js dynamic import
    const Firecrawl = (await import('@mendable/firecrawl-js')).default
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY,
    })

    // Extract product data using Firecrawl (frontend handles retries, backend focuses on single robust attempt)
    const scrapeResult = await firecrawl.scrape(args.url, {
      formats: [
        {
          type: 'json',
          prompt: `Extract detailed product information from this e-commerce page. Focus on the main product being sold, including current price, brand, description, and availability status. If the product is on sale, include both current and original prices.`,
          schema: PRODUCT_EXTRACTION_SCHEMA,
        },
      ],
      onlyMainContent: true,
      timeout: 60000, // Increased timeout since frontend handles retries
    })

    // Handle the response format - Firecrawl returns JSON data in .json field (root level)
    const extractedData =
      (scrapeResult as any).json ||
      (scrapeResult as any).data?.json ||
      (scrapeResult as any).data

    // Validate that we got data from Firecrawl
    if (!extractedData) {
      console.error(
        'No data extracted from Firecrawl. Full response:',
        scrapeResult,
      )
      throw new Error(
        'Failed to extract product data from URL - no data returned from Firecrawl',
      )
    }

    // Validate required fields
    if (
      !extractedData.name ||
      typeof extractedData.price !== 'number' ||
      !extractedData.currency
    ) {
      throw new Error('Missing required product information from extraction')
    }

    // Map extracted data to our product structure
    const productData = {
      url: args.url,
      name: extractedData.name,
      description: extractedData.description || '',
      price: extractedData.price,
      currency: extractedData.currency,
      originalPrice: safeOptionalNumber(extractedData.originalPrice), // Safely handle null/undefined for optional field
      platform: extractedData.platform || detectPlatformFromUrl(args.url),
      imageUrl: extractedData.images?.[0], // Use first image
      brand: safeOptionalString(extractedData.brand), // Safely handle null/undefined/empty strings
      category: safeOptionalString(extractedData.category), // Safely handle null/undefined/empty strings
      availability: extractedData.availability ?? true,
      searchQuery: extractedData.name, // Use product name as search query for alternatives
    }

    // Store the extracted product
    const productId = (await ctx.runMutation(
      api.search.extractProduct,
      productData,
    )) as Id<'products'>

    // Update search record if provided
    if (args.searchId) {
      await ctx.runMutation(api.search.updateSearchSuccess, {
        searchId: args.searchId,
        successful: true,
        comparisonId: undefined, // Will be set when comparison is created
      })
    }

    return {
      productId,
      ...productData,
      searchQuery: productData.searchQuery,
    }
  } catch (error) {
    console.error('Failed to extract product:', error)

    // Classify error for better user messaging
    const errorMessage = classifyExtractionError(error)

    // Update search record with failure
    if (args.searchId) {
      await ctx.runMutation(api.search.updateSearchSuccess, {
        searchId: args.searchId,
        successful: false,
        error: errorMessage,
      })
    }

    // Throw a more user-friendly error
    throw new Error(errorMessage)
  }
}

export const extractProductFromUrl = action({
  args: {
    url: v.string(),
    searchId: v.optional(v.id('searches')),
  },
  handler: extractProductFromUrlHandler,
})

// Search for similar products across platforms
type SearchSimilarProductsArgs = {
  searchQuery: string
  originalPlatform: string
  comparisonId: Id<'comparisons'>
}

type SearchSimilarProductsResult = {
  productIds: Id<'products'>[]
  products: Array<{
    name: string
    price: number
    currency: string
    platform: string
    url: string
    availability: boolean
    searchQuery: string
    description?: string
    imageUrl?: string
    brand?: string
    category?: string
    originalPrice?: number
  }>
}

const searchSimilarProductsHandler = async (
  ctx: ActionCtx,
  args: SearchSimilarProductsArgs,
): Promise<SearchSimilarProductsResult> => {
  try {
    console.log('Searching for similar products:', args.searchQuery)

    // Validate input
    if (
      !args.searchQuery ||
      typeof args.searchQuery !== 'string' ||
      args.searchQuery.trim().length === 0
    ) {
      throw new Error('Invalid search query provided')
    }

    if (!args.originalPlatform || typeof args.originalPlatform !== 'string') {
      throw new Error('Invalid original platform provided')
    }

    // Check for API key
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error('Firecrawl API key not configured')
    }

    // Initialize Firecrawl client
    // @ts-ignore - @mendable/firecrawl-js dynamic import
    const Firecrawl = (await import('@mendable/firecrawl-js')).default
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY,
    })

    // Define target platforms (excluding the original platform)
    const targetPlatforms = [
      'amazon',
      'ebay',
      'walmart',
      'bestbuy',
      'target',
    ].filter((platform) => platform !== args.originalPlatform)

    const foundProducts: SearchSimilarProductsResult['products'] = []
    const maxProductsPerPlatform = 2 // Limit to avoid too many results

    // Search each platform for similar products
    for (const platform of targetPlatforms) {
      try {
        const platformSearchQuery = buildPlatformSearchQuery(
          args.searchQuery,
          platform,
        )

        console.log(`Searching ${platform} for: ${platformSearchQuery}`)

        const searchResult = await firecrawl.search(platformSearchQuery, {
          limit: maxProductsPerPlatform + 2, // Get a few extra to filter
        })

        if (searchResult) {
          // Process search results and extract product data
          const platformProducts = await processSearchResults(
            searchResult as any,
            platform,
            args.searchQuery,
          )

          // Limit results per platform
          foundProducts.push(
            ...platformProducts.slice(0, maxProductsPerPlatform),
          )
        }
      } catch (platformError) {
        console.warn(`Failed to search ${platform}:`, platformError)
        // Continue with other platforms
      }
    }

    // If no products found, still complete successfully (no alternatives available)
    if (foundProducts.length === 0) {
      console.log(
        'No similar products found on other platforms - this is normal',
      )

      // Update comparison as completed with empty results
      await ctx.runMutation(api.search.updateComparison, {
        comparisonId: args.comparisonId,
        status: 'completed',
        productIds: [],
      })

      return { productIds: [], products: [] }
    }

    // Store the found products in database
    const productIds: Id<'products'>[] = await Promise.all(
      foundProducts.map(
        (product) =>
          ctx.runMutation(api.search.extractProduct, {
            url: product.url,
            name: product.name,
            description: product.description,
            price: product.price,
            currency: product.currency,
            originalPrice: safeOptionalNumber(product.originalPrice), // Safely handle null/undefined for optional field
            platform: product.platform,
            imageUrl: product.imageUrl,
            brand: safeOptionalString(product.brand), // Safely handle null/undefined/empty strings
            category: safeOptionalString(product.category), // Safely handle null/undefined/empty strings
            availability: product.availability,
            searchQuery: args.searchQuery,
          }) as Promise<Id<'products'>>,
      ),
    )

    // Update comparison with results
    await ctx.runMutation(api.search.updateComparison, {
      comparisonId: args.comparisonId,
      status: 'completed',
      productIds,
    })

    return { productIds, products: foundProducts }
  } catch (error) {
    console.error('Failed to search similar products:', error)

    // Classify error for better user messaging
    const errorMessage = classifySearchError(error)

    // Update comparison with failure
    await ctx.runMutation(api.search.updateComparison, {
      comparisonId: args.comparisonId,
      status: 'failed',
      productIds: [],
      error: errorMessage,
    })

    // Throw a more user-friendly error
    throw new Error(errorMessage)
  }
}

export const searchSimilarProducts = action({
  args: {
    searchQuery: v.string(),
    originalPlatform: v.string(),
    comparisonId: v.id('comparisons'),
  },
  handler: searchSimilarProductsHandler,
})

// ===== HELPER FUNCTIONS =====

// Detect platform from URL
const detectPlatformFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('amazon.')) return 'amazon'
    if (hostname.includes('ebay.')) return 'ebay'
    if (hostname.includes('walmart.')) return 'walmart'
    if (hostname.includes('bestbuy.')) return 'bestbuy'
    if (hostname.includes('target.')) return 'target'
    if (hostname.includes('mercadolibre.') || hostname.includes('mercadolivre.')) return 'mercadolibre'

    return 'unknown'
  } catch (error) {
    console.warn('Failed to parse URL for platform detection:', url, error)
    return 'unknown'
  }
}

// Build platform-specific search query
const buildPlatformSearchQuery = (baseQuery: string, platform: string): string => {
  const siteMap: Record<string, string> = {
    amazon: 'site:amazon.com',
    ebay: 'site:ebay.com',
    walmart: 'site:walmart.com',
    bestbuy: 'site:bestbuy.com',
    target: 'site:target.com',
  }

  const siteFilter = siteMap[platform] || ''
  return `${baseQuery} ${siteFilter}`.trim()
}

// Process Firecrawl search results and extract product data
const processSearchResults = async (
  searchData: unknown,
  platform: string,
  searchQuery: string
): Promise<SearchSimilarProductsResult['products']> => {
  const products: SearchSimilarProductsResult['products'] = []

  // Handle different Firecrawl response formats
  const data = searchData as { web?: unknown[]; results?: unknown[] }
  const results = data.web || data.results || []

  for (const result of results) {
    const item = result as { url?: string; title?: string; description?: string; snippet?: string }
    try {
      // Skip if no URL or if it's not a product page
      if (!item.url || !isProductUrl(item.url, platform)) {
        continue
      }

      // For now, create basic product data from search result
      // In a production version, you might want to scrape each URL individually
      const product = {
        name: item.title || 'Unknown Product',
        price: extractPriceFromSnippet(item.description || item.snippet || ''),
        currency: 'USD', // Default, could be enhanced with geo-detection
        originalPrice: undefined, // Not available from search results
        platform,
        url: item.url,
        availability: true, // Assume available unless specified otherwise
        searchQuery,
        description: item.description || item.snippet,
        imageUrl: undefined,
        brand: undefined,
        category: undefined,
      }

      // Only include if we found a reasonable price
      if (product.price > 0) {
        products.push(product)
      }
    } catch (error) {
      console.warn('Failed to process search result:', error)
      continue
    }
  }

  return products
}

// Check if URL is likely a product page
const isProductUrl = (url: string, platform: string): boolean => {
  const urlLower = url.toLowerCase()

  // Skip search, category, and other non-product pages
  if (urlLower.includes('/search') ||
      urlLower.includes('/category') ||
      urlLower.includes('/departments') ||
      urlLower.includes('/collections') ||
      urlLower.includes('/b/') || // Amazon browse nodes
      urlLower.includes('/stores/')) {
    return false
  }

  // Platform-specific product URL patterns
  const productPatterns: Record<string, RegExp[]> = {
    amazon: [/\/dp\/[A-Z0-9]+/i, /\/gp\/product\/[A-Z0-9]+/i],
    ebay: [/\/itm\//, /\/p\//],
    walmart: [/\/ip\//],
    bestbuy: [/\/site\//],
    target: [/\/p\//],
  }

  const patterns = productPatterns[platform] || []
  return patterns.some(pattern => pattern.test(urlLower))
}

// Extract price from text snippet (basic implementation)
const extractPriceFromSnippet = (text: string): number => {
  // Look for price patterns like $99.99, $1,299.99, etc.
  const priceRegex = /\$([0-9,]+(?:\.[0-9]{2})?)/g
  const matches = text.match(priceRegex)

  if (!matches) return 0

  // Take the first price found (usually the most relevant)
  const firstMatch = matches[0]
  const priceStr = firstMatch.replace(/[,$]/g, '')
  const price = parseFloat(priceStr)

  return isNaN(price) ? 0 : price
}
