// Unit tests for retry logic and error classification functions
// These tests focus on the retry utilities that can be tested in isolation

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  retryWithBackoff,
  RETRY_CONFIG,
  isNonRetryableError,
  classifyExtractionError,
  classifySearchError,
} from './test-helpers/retryHelpers'

// Test constants to reduce duplication
const TEST_CONFIG = { maxRetries: 2, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 2 } as const
const TEST_CONFIG_NO_RETRIES = { maxRetries: 0, baseDelay: 100, maxDelay: 1000, backoffMultiplier: 2 } as const

describe('retry logic utilities', () => {
  // Mock timers for testing delays
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('retryWithBackoff', () => {
    test('returns result on first successful attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(operation, TEST_CONFIG, 'test')

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    test('retries on failure and succeeds on retry', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce('success on retry')

      const result = await retryWithBackoff(operation, TEST_CONFIG, 'test')

      expect(result).toBe('success on retry')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    test('uses exponential backoff delays', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success')

      const delaySpy = vi.spyOn(global, 'setTimeout')

      const promise = retryWithBackoff(operation, {
        maxRetries: 2,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 2
      }, 'test')

      // Fast-forward through the delays
      await vi.advanceTimersByTimeAsync(100) // First delay: 100ms
      await vi.advanceTimersByTimeAsync(200) // Second delay: 200ms
      await vi.advanceTimersByTimeAsync(0)   // Allow the final call

      const result = await promise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 100)
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 200)
    })

    test('respects maximum delay limit', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success')

      const delaySpy = vi.spyOn(global, 'setTimeout')

      const promise = retryWithBackoff(operation, {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 200, // Low max delay
        backoffMultiplier: 10 // High multiplier
      }, 'test')

      // Fast-forward through the delays (should be capped at maxDelay)
      await vi.advanceTimersByTimeAsync(200)
      await vi.advanceTimersByTimeAsync(200)
      await vi.advanceTimersByTimeAsync(0)

      const result = await promise

      expect(result).toBe('success')
      // Should use maxDelay (200ms) instead of calculated delays
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 200)
    })

    test('throws immediately on non-retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('API key missing'))

      await expect(
        retryWithBackoff(operation, TEST_CONFIG, 'test')
      ).rejects.toThrow('API key missing')

      expect(operation).toHaveBeenCalledTimes(1)
    })

    test('throws after all retries exhausted', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'))

      await expect(
        retryWithBackoff(operation, TEST_CONFIG, 'test')
      ).rejects.toThrow('Persistent failure')

      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    test('uses default config when none provided', async () => {
      const operation = vi.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    test('handles non-Error exceptions', async () => {
      const operation = vi.fn().mockRejectedValue('String error')

      await expect(
        retryWithBackoff(operation, TEST_CONFIG_NO_RETRIES, 'test')
      ).rejects.toThrow('String error')
    })
  })

  describe('isNonRetryableError', () => {
    // Test cases for non-retryable errors (should return true)
    const nonRetryableCases = [
      ['API key errors', ['API key missing', 'Firecrawl API key not configured']],
      ['authorization errors', ['Unauthorized access', 'Forbidden request']],
      ['invalid URL errors', ['Invalid URL provided', 'Invalid URL format']],
      ['validation errors', ['Missing required field', 'Missing required product information']],
    ]

    // Test cases for retryable errors (should return false)
    const retryableCases = [
      ['timeout errors', ['timeout of 35000ms exceeded', 'Request timed out']],
      ['network errors', ['Network connection failed', 'ECONNREFUSED']],
      ['rate limit errors', ['Rate limit exceeded', 'Too many requests']],
    ]

    nonRetryableCases.forEach(([category, messages]) => {
      test(`identifies ${category} as non-retryable`, () => {
        (messages as string[]).forEach((message: string) => {
          expect(isNonRetryableError(new Error(message))).toBe(true)
        })
      })
    })

    retryableCases.forEach(([category, messages]) => {
      test(`treats ${category} as retryable`, () => {
        (messages as string[]).forEach((message: string) => {
          expect(isNonRetryableError(new Error(message))).toBe(false)
        })
      })
    })

    test('is case insensitive', () => {
      expect(isNonRetryableError(new Error('api KEY missing'))).toBe(true)
      expect(isNonRetryableError(new Error('INVALID url'))).toBe(true)
    })
  })

  describe('classifyExtractionError', () => {
    // Helper function to reduce test duplication
    const testErrorClassification = (errorInput: unknown, expectedPhrases: string[]) => {
      const result = classifyExtractionError(errorInput)
      expectedPhrases.forEach(phrase => {
        expect(result).toContain(phrase)
      })
    }

    test('classifies timeout errors', () => {
      testErrorClassification(new Error('timeout of 35000ms exceeded'), ['took too long to load', 'slow websites'])
    })

    test('classifies network errors', () => {
      testErrorClassification(new Error('Network connection failed'), ['Unable to connect', 'check the URL'])
    })

    test('classifies API key errors', () => {
      testErrorClassification(new Error('API key missing'), ['Service temporarily unavailable'])
    })

    test('classifies invalid URL errors', () => {
      testErrorClassification(new Error('Invalid URL provided'), ['appears to be invalid'])
    })

    test('classifies content extraction errors', () => {
      testErrorClassification(new Error('No data extracted from Firecrawl'), ['Unable to extract product information'])
    })

    test('classifies rate limit errors', () => {
      testErrorClassification(new Error('Rate limit exceeded'), ['Too many requests', 'wait a moment'])
    })

    test('provides default message for unknown errors', () => {
      testErrorClassification(new Error('Some unknown error'), ['Unable to analyze this product page'])
    })

    test('handles non-Error inputs', () => {
      testErrorClassification('string error', ['unexpected error occurred'])
    })

    test('handles null/undefined', () => {
      testErrorClassification(null, ['unexpected error occurred'])
      testErrorClassification(undefined, ['unexpected error occurred'])
    })
  })

  describe('classifySearchError', () => {
    // Helper function to reduce test duplication
    const testErrorClassification = (errorInput: unknown, expectedPhrases: string[]) => {
      const result = classifySearchError(errorInput)
      expectedPhrases.forEach(phrase => {
        expect(result).toContain(phrase)
      })
    }

    test('classifies timeout errors', () => {
      testErrorClassification(new Error('timeout exceeded'), ['took too long to complete'])
    })

    test('classifies network errors', () => {
      testErrorClassification(new Error('Network connection failed'), ['Unable to connect to search services'])
    })

    test('classifies API key errors', () => {
      testErrorClassification(new Error('API key missing'), ['Search service temporarily unavailable'])
    })

    test('classifies rate limit errors', () => {
      testErrorClassification(new Error('Rate limit exceeded'), ['Too many search requests'])
    })

    test('classifies empty results', () => {
      testErrorClassification(new Error('No results found'), ['No similar products found'])
    })

    test('provides default message for unknown errors', () => {
      testErrorClassification(new Error('Some unknown search error'), ['Unable to search for similar products'])
    })

    test('handles non-Error inputs', () => {
      testErrorClassification(42, ['unexpected error occurred'])
    })
  })

  describe('RETRY_CONFIG', () => {
    test('has correct default values', () => {
      expect(RETRY_CONFIG).toEqual({
        maxRetries: 3,
        baseDelay: 1000, // 1 second
        maxDelay: 10000, // 10 seconds
        backoffMultiplier: 2,
      })
    })
  })
})
