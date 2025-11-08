// @ts-ignore - convex/values import may not be resolved in some environments
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

// ===== SEARCH FUNCTIONS =====

// Create a new search record
export const createSearch = mutation({
  args: {
    url: v.string(),
    successful: v.boolean(),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: { url: string; successful: boolean; userAgent?: string; ip?: string },
  ) => {
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
  handler: async (
    ctx: MutationCtx,
    args: {
      searchId: Id<'searches'>
      successful: boolean
      comparisonId?: Id<'comparisons'>
      error?: string
    },
  ) => {
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
  handler: async (
    ctx: MutationCtx,
    args: {
      url: string
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
      metadata?: unknown
    },
  ) => {
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
  handler: async (
    ctx: MutationCtx,
    args: { originalProductId: Id<'products'>; searchQuery: string },
  ) => {
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
    status: v.union(
      v.literal('searching'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    productIds: v.array(v.id('products')),
    error: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx,
    args: {
      comparisonId: Id<'comparisons'>
      status: 'searching' | 'completed' | 'failed'
      productIds: Id<'products'>[]
      error?: string
    },
  ) => {
    await ctx.db.patch(args.comparisonId, {
      status: args.status,
      productIds: args.productIds,
      completedAt:
        args.status === 'completed' || args.status === 'failed'
          ? Date.now()
          : undefined,
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
      comparison.productIds.map((id: Id<'products'>) => ctx.db.get(id)),
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



