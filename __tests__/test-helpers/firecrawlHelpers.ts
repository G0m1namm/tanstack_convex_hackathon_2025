// Test helper functions for firecrawlActions tests
// These functions mirror the logic from the actual firecrawlActions but are
// included here for isolated testing without external dependencies

export const detectPlatformFromUrl = (url: string): string => {
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

export const buildPlatformSearchQuery = (baseQuery: string, platform: string): string => {
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

export const extractPriceFromSnippet = (text: string): number => {
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

// Utility function to safely handle optional fields from Firecrawl
// Converts null, undefined, or empty strings to undefined for Convex compatibility
export const safeOptionalString = (value: any): string | undefined => {
  return (value === null || value === undefined || value === '') ? undefined : String(value)
}

// Utility function to safely handle optional numbers from Firecrawl
// Converts null, undefined, or invalid numbers to undefined for Convex compatibility
export const safeOptionalNumber = (value: any): number | undefined => {
  if (value === null || value === undefined) return undefined
  const num = Number(value)
  return isNaN(num) ? undefined : num
}

export const isProductUrl = (url: string, platform: string): boolean => {
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
