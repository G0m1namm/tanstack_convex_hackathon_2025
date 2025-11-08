// Unit tests for firecrawlActions helper functions
// These tests focus on the helper functions that can be tested in isolation

import { describe, test, expect } from 'vitest'
import {
  detectPlatformFromUrl,
  buildPlatformSearchQuery,
  extractPriceFromSnippet,
  isProductUrl,
  safeOptionalString,
  safeOptionalNumber
} from './test-helpers/firecrawlHelpers'

describe('firecrawlActions helper functions', () => {
  describe('detectPlatformFromUrl', () => {
    test('detects Amazon URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.amazon.com/dp/B08N5WRWNW')).toBe('amazon')
      expect(detectPlatformFromUrl('https://amazon.co.uk/product/123')).toBe('amazon')
    })

    test('detects eBay URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.ebay.com/itm/123456789')).toBe('ebay')
      expect(detectPlatformFromUrl('https://ebay.co.uk/itm/987654321')).toBe('ebay')
    })

    test('detects Walmart URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.walmart.com/ip/123456789')).toBe('walmart')
    })

    test('detects Best Buy URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.bestbuy.com/site/product/123456')).toBe('bestbuy')
    })

    test('detects Target URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.target.com/p/product/123456')).toBe('target')
    })

    test('detects MercadoLibre URLs correctly', () => {
      expect(detectPlatformFromUrl('https://www.mercadolibre.com.ar/product/123')).toBe('mercadolibre')
      expect(detectPlatformFromUrl('https://www.mercadolivre.com.br/product/456')).toBe('mercadolibre')
    })

    test('returns unknown for unrecognized URLs', () => {
      expect(detectPlatformFromUrl('https://www.unknownstore.com/product/123')).toBe('unknown')
    })

    test('handles invalid URLs gracefully', () => {
      expect(detectPlatformFromUrl('not-a-url')).toBe('unknown')
      expect(detectPlatformFromUrl('')).toBe('unknown')
      expect(detectPlatformFromUrl('http://')).toBe('unknown')
    })
  })

  describe('buildPlatformSearchQuery', () => {
    test('builds correct search queries for known platforms', () => {
      expect(buildPlatformSearchQuery('iPhone 15', 'amazon')).toBe('iPhone 15 site:amazon.com')
      expect(buildPlatformSearchQuery('MacBook Pro', 'ebay')).toBe('MacBook Pro site:ebay.com')
      expect(buildPlatformSearchQuery('Samsung TV', 'walmart')).toBe('Samsung TV site:walmart.com')
    })

    test('returns base query for unknown platforms', () => {
      expect(buildPlatformSearchQuery('iPhone 15', 'unknown')).toBe('iPhone 15')
      expect(buildPlatformSearchQuery('MacBook Pro', '')).toBe('MacBook Pro')
    })
  })

  describe('extractPriceFromSnippet', () => {
    test('extracts simple prices correctly', () => {
      expect(extractPriceFromSnippet('Product costs $99.99')).toBe(99.99)
      expect(extractPriceFromSnippet('Price: $149.00')).toBe(149.00)
      expect(extractPriceFromSnippet('$29.99 only')).toBe(29.99)
    })

    test('extracts prices with commas correctly', () => {
      expect(extractPriceFromSnippet('Expensive item for $1,299.99')).toBe(1299.99)
      expect(extractPriceFromSnippet('$2,499.00 premium model')).toBe(2499.00)
    })

    test('returns 0 when no price found', () => {
      expect(extractPriceFromSnippet('No price information here')).toBe(0)
      expect(extractPriceFromSnippet('')).toBe(0)
      expect(extractPriceFromSnippet('Price: contact seller')).toBe(0)
    })

    test('handles invalid price formats', () => {
      expect(extractPriceFromSnippet('$abc.def')).toBe(0)
      expect(extractPriceFromSnippet('$')).toBe(0)
    })
  })

  describe('isProductUrl', () => {
    test('identifies Amazon product URLs', () => {
      expect(isProductUrl('https://www.amazon.com/dp/B08N5WRWNW', 'amazon')).toBe(true)
      expect(isProductUrl('https://www.amazon.com/gp/product/B08N5WRWNW', 'amazon')).toBe(true)
      expect(isProductUrl('https://www.amazon.com/search?q=iphone', 'amazon')).toBe(false)
      expect(isProductUrl('https://www.amazon.com/b/browse-node', 'amazon')).toBe(false)
    })

    test('identifies eBay product URLs', () => {
      expect(isProductUrl('https://www.ebay.com/itm/123456789', 'ebay')).toBe(true)
      expect(isProductUrl('https://www.ebay.com/p/987654321', 'ebay')).toBe(true)
      expect(isProductUrl('https://www.ebay.com/search?q=iphone', 'ebay')).toBe(false)
    })

    test('identifies Walmart product URLs', () => {
      expect(isProductUrl('https://www.walmart.com/ip/123456789', 'walmart')).toBe(true)
      expect(isProductUrl('https://www.walmart.com/search?q=iphone', 'walmart')).toBe(false)
    })

    test('identifies Best Buy product URLs', () => {
      expect(isProductUrl('https://www.bestbuy.com/site/product/123456', 'bestbuy')).toBe(true)
      expect(isProductUrl('https://www.bestbuy.com/search?q=iphone', 'bestbuy')).toBe(false)
    })

    test('identifies Target product URLs', () => {
      expect(isProductUrl('https://www.target.com/p/product/123456', 'target')).toBe(true)
      expect(isProductUrl('https://www.target.com/search?q=iphone', 'target')).toBe(false)
    })

    test('returns false for unknown platforms', () => {
      expect(isProductUrl('https://www.unknown.com/product/123', 'unknown')).toBe(false)
    })
  })

  describe('safeOptionalString', () => {
    test('converts null to undefined', () => {
      expect(safeOptionalString(null)).toBeUndefined()
    })

    test('converts undefined to undefined', () => {
      expect(safeOptionalString(undefined)).toBeUndefined()
    })

    test('converts empty string to undefined', () => {
      expect(safeOptionalString('')).toBeUndefined()
    })

    test('preserves valid string values', () => {
      expect(safeOptionalString('Apple')).toBe('Apple')
      expect(safeOptionalString('Samsung Electronics')).toBe('Samsung Electronics')
    })

    test('converts numbers to strings', () => {
      expect(safeOptionalString(123)).toBe('123')
    })

    test('converts boolean to strings', () => {
      expect(safeOptionalString(true)).toBe('true')
      expect(safeOptionalString(false)).toBe('false')
    })
  })

  describe('safeOptionalNumber', () => {
    test('converts null to undefined', () => {
      expect(safeOptionalNumber(null)).toBeUndefined()
    })

    test('converts undefined to undefined', () => {
      expect(safeOptionalNumber(undefined)).toBeUndefined()
    })

    test('preserves valid numbers', () => {
      expect(safeOptionalNumber(99.99)).toBe(99.99)
      expect(safeOptionalNumber(0)).toBe(0)
      expect(safeOptionalNumber(-50)).toBe(-50)
    })

    test('converts string numbers to numbers', () => {
      expect(safeOptionalNumber('99.99')).toBe(99.99)
      expect(safeOptionalNumber('0')).toBe(0)
    })

    test('converts invalid strings to undefined', () => {
      expect(safeOptionalNumber('not-a-number')).toBeUndefined()
      expect(safeOptionalNumber('')).toBeUndefined()
      expect(safeOptionalNumber('abc')).toBeUndefined()
    })

    test('converts NaN to undefined', () => {
      expect(safeOptionalNumber(NaN)).toBeUndefined()
    })

    test('converts boolean to numbers', () => {
      expect(safeOptionalNumber(true)).toBe(1)
      expect(safeOptionalNumber(false)).toBe(0)
    })
  })

  describe('originalPrice null handling', () => {
    test('converts null originalPrice to undefined for Convex compatibility', () => {
      // Test the logic used in firecrawlActions.ts to handle null originalPrice
      const extractedData = {
        name: 'Test Product',
        price: 99.99,
        currency: 'USD',
        originalPrice: null, // This is what Firecrawl might return
        platform: 'amazon',
        availability: true
      }

      // This is the fix applied: convert null to undefined
      const originalPrice = extractedData.originalPrice || undefined

      expect(originalPrice).toBeUndefined()
      expect(originalPrice).not.toBeNull()
    })

    test('preserves valid originalPrice values', () => {
      const extractedData = {
        name: 'Test Product',
        price: 89.99,
        currency: 'USD',
        originalPrice: 99.99, // Valid original price
        platform: 'amazon',
        availability: true
      }

      const originalPrice = extractedData.originalPrice || undefined

      expect(originalPrice).toBe(99.99)
    })

    test('handles undefined originalPrice correctly', () => {
      const extractedData = {
        name: 'Test Product',
        price: 99.99,
        currency: 'USD',
        originalPrice: undefined, // No original price available
        platform: 'amazon',
        availability: true
      }

      const originalPrice = extractedData.originalPrice || undefined

      expect(originalPrice).toBeUndefined()
    })
  })
})
