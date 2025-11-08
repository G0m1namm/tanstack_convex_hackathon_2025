// @ts-ignore - convex/values import may not be resolved in some environments
import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'
import type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { api } from './_generated/api'

// ===== SEARCH FUNCTIONS =====

// Create a new search record
export const createSearch = mutation({
  args: {
    url: v.string(),
    successful: v.boolean(),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: { url: string; successful: boolean; userAgent?: string; ip?: string }) => {
    const searchId = await ctx.db.insert('searches', {
      url: args.url,
      successful: args.successful,
      createdAt: Date.now(),
      userAgent: args.userAgent,
      ip: args.ip,
    })
    return searchId
  },
})

// Update search success status
export const updateSearchSuccess = mutation({
  args: {
    searchId: v.id('searches'),
    successful: v.boolean(),
    comparisonId: v.optional(v.id('comparisons')),
    error: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: { searchId: Id<'searches'>; successful: boolean; comparisonId?: Id<'comparisons'>; error?: string }) => {
    await ctx.db.patch(args.searchId, {
      successful: args.successful,
      comparisonId: args.comparisonId,
      error: args.error,
    })
  },
})

// ===== PRODUCT FUNCTIONS =====

// Extract product from URL and store it
export const extractProduct = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    originalPrice: v.optional(v.number()),
    platform: v.string(),
    imageUrl: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
    availability: v.boolean(),
    searchQuery: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx: MutationCtx, args: {
    url: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    originalPrice?: number;
    platform: string;
    imageUrl?: string;
    brand?: string;
    category?: string;
    availability: boolean;
    searchQuery: string;
    metadata?: unknown;
  }) => {
    const productId = await ctx.db.insert('products', {
      ...args,
      extractedAt: Date.now(),
    })
    return productId
  },
})

// ===== COMPARISON FUNCTIONS =====

// Create a new comparison session
export const createComparison = mutation({
  args: {
    originalProductId: v.id('products'),
    searchQuery: v.string(),
  },
  handler: async (ctx: MutationCtx, args: { originalProductId: Id<'products'>; searchQuery: string }) => {
    const comparisonId = await ctx.db.insert('comparisons', {
      originalProductId: args.originalProductId,
      searchQuery: args.searchQuery,
      status: 'searching',
      createdAt: Date.now(),
      productIds: [],
    })
    return comparisonId
  },
})

// Update comparison with results
export const updateComparison = mutation({
  args: {
    comparisonId: v.id('comparisons'),
    status: v.union(v.literal('searching'), v.literal('completed'), v.literal('failed')),
    productIds: v.array(v.id('products')),
    error: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args: {
    comparisonId: Id<'comparisons'>;
    status: 'searching' | 'completed' | 'failed';
    productIds: Id<'products'>[];
    error?: string;
  }) => {
    await ctx.db.patch(args.comparisonId, {
      status: args.status,
      productIds: args.productIds,
      completedAt: args.status === 'completed' || args.status === 'failed' ? Date.now() : undefined,
      error: args.error,
    })
  },
})

// Get comparison results
export const getComparison = query({
  args: { comparisonId: v.id('comparisons') },
  handler: async (ctx: QueryCtx, args: { comparisonId: Id<'comparisons'> }) => {
    const comparison = await ctx.db.get(args.comparisonId)
    if (!comparison) return null

    // Get all products in the comparison
    const products = await Promise.all(
      comparison.productIds.map((id: Id<'products'>) => ctx.db.get(id))
    )

    // Get the original product
    const originalProduct = await ctx.db.get(comparison.originalProductId)

    return {
      ...comparison,
      products: products.filter(Boolean), // Remove any null products
      originalProduct,
    }
  },
})

// ===== HELPER FUNCTIONS =====

// Detect platform from URL
const detectPlatformFromUrl = (url: string): string => {
  const hostname = new URL(url).hostname.toLowerCase()

  if (hostname.includes('amazon.')) return 'amazon'
  if (hostname.includes('ebay.')) return 'ebay'
  if (hostname.includes('walmart.')) return 'walmart'
  if (hostname.includes('bestbuy.')) return 'bestbuy'
  if (hostname.includes('target.')) return 'target'
  if (hostname.includes('mercadolibre.') || hostname.includes('mercadolivre.')) return 'mercadolibre'

  return 'unknown'
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
    amazon: [/\/dp\/[A-Z0-9]+/, /\/gp\/product\/[A-Z0-9]+/],
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

// ===== ACTIONS (for external API calls) =====

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

    // Initialize Firecrawl client
    // @ts-ignore - @mendable/firecrawl-js dynamic import
    const Firecrawl = (await import('@mendable/firecrawl-js')).default
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    })

    // Extract product data using Firecrawl
    const scrapeResult = await firecrawl.scrapeUrl(args.url, {
      formats: ['json'],
      jsonOptions: {
        schema: PRODUCT_EXTRACTION_SCHEMA,
        prompt: `Extract detailed product information from this e-commerce page. Focus on the main product being sold, including current price, brand, description, and availability status. If the product is on sale, include both current and original prices.`
      },
      onlyMainContent: true,
      timeout: 30000, // 30 seconds
    })

    if (!scrapeResult.success) {
      throw new Error(`Firecrawl extraction failed: ${scrapeResult.error}`)
    }

    const extractedData = scrapeResult.data.json

    // Validate required fields
    if (!extractedData.name || typeof extractedData.price !== 'number' || !extractedData.currency) {
      throw new Error('Missing required product information from extraction')
    }

    // Map extracted data to our product structure
    const productData = {
      url: args.url,
      name: extractedData.name,
      description: extractedData.description || '',
      price: extractedData.price,
      currency: extractedData.currency,
      originalPrice: extractedData.originalPrice,
      platform: extractedData.platform || detectPlatformFromUrl(args.url),
      imageUrl: extractedData.images?.[0], // Use first image
      brand: extractedData.brand,
      category: extractedData.category,
      availability: extractedData.availability ?? true,
      searchQuery: extractedData.name, // Use product name as search query for alternatives
    }

    // Store the extracted product
    const productId = (await ctx.runMutation(api.search.extractProduct, productData)) as Id<'products'>

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

    // Update search record with failure
    if (args.searchId) {
      await ctx.runMutation(api.search.updateSearchSuccess, {
        searchId: args.searchId,
        successful: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }

    throw error
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

    // Initialize Firecrawl client
    // @ts-ignore - @mendable/firecrawl-js dynamic import
    const Firecrawl = (await import('@mendable/firecrawl-js')).default
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    })

    // Define target platforms (excluding the original platform)
    const targetPlatforms = ['amazon', 'ebay', 'walmart', 'bestbuy', 'target']
      .filter(platform => platform !== args.originalPlatform)

    const foundProducts: SearchSimilarProductsResult['products'] = []
    const maxProductsPerPlatform = 2 // Limit to avoid too many results

    // Search each platform for similar products
    for (const platform of targetPlatforms) {
      try {
        const platformSearchQuery = buildPlatformSearchQuery(args.searchQuery, platform)

        console.log(`Searching ${platform} for: ${platformSearchQuery}`)

        const searchResult = await firecrawl.search(platformSearchQuery, {
          limit: maxProductsPerPlatform + 2, // Get a few extra to filter
          format: 'json',
          scrapeOptions: {
            formats: ['json'],
            jsonOptions: {
              schema: PRODUCT_EXTRACTION_SCHEMA,
              prompt: `Extract product information from this search result page. Focus on products that are similar to "${args.searchQuery}". Include price, availability, and product details.`
            },
            onlyMainContent: true,
            timeout: 20000,
          }
        })

        if (searchResult.success && searchResult.data) {
          // Process search results and extract product data
          const platformProducts = await processSearchResults(searchResult.data, platform, args.searchQuery)

          // Limit results per platform
          foundProducts.push(...platformProducts.slice(0, maxProductsPerPlatform))
        }
      } catch (platformError) {
        console.warn(`Failed to search ${platform}:`, platformError)
        // Continue with other platforms
      }
    }

    if (foundProducts.length === 0) {
      throw new Error('No similar products found on other platforms')
    }

    // Store the found products in database
    const productIds: Id<'products'>[] = await Promise.all(
      foundProducts.map(product =>
        ctx.runMutation(api.search.extractProduct, {
          url: product.url,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          originalPrice: product.originalPrice,
          platform: product.platform,
          imageUrl: product.imageUrl,
          brand: product.brand,
          category: product.category,
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

    // Update comparison with failure
    await ctx.runMutation(api.search.updateComparison, {
      comparisonId: args.comparisonId,
      status: 'failed',
      productIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
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
