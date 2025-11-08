import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Legacy test table - can be removed later
  numbers: defineTable({
    value: v.number(),
  }),

  // Store individual product information extracted from URLs
  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(), // USD, EUR, etc.
    originalPrice: v.optional(v.number()), // For discounts
    platform: v.string(), // amazon, ebay, walmart, etc.
    url: v.string(),
    imageUrl: v.optional(v.string()),
    brand: v.optional(v.string()),
    category: v.optional(v.string()),
    availability: v.boolean(), // in stock or not
    extractedAt: v.number(), // timestamp
    searchQuery: v.string(), // what was searched to find this
    metadata: v.optional(v.any()), // additional platform-specific data
  }).index("by_platform_search", ["platform", "searchQuery"])
   .index("by_url", ["url"]),

  // Store comparison sessions/results
  comparisons: defineTable({
    originalProductId: v.id("products"), // the product user searched for
    searchQuery: v.string(), // extracted product name + brand
    status: v.union(v.literal("searching"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    productIds: v.array(v.id("products")), // found alternative products
    error: v.optional(v.string()), // if extraction/search failed
  }).index("by_status_created", ["status", "createdAt"])
   .index("by_created_at", ["createdAt"]),

  // Store user searches for analytics (future feature)
  searches: defineTable({
    url: v.string(),
    userAgent: v.optional(v.string()),
    ip: v.optional(v.string()),
    createdAt: v.number(),
    successful: v.boolean(),
    comparisonId: v.optional(v.id("comparisons")),
    error: v.optional(v.string()),
  }).index("by_created_at", ["createdAt"])
   .index("by_successful", ["successful"]),

  // Store discovered deals/community deals (future feature)
  deals: defineTable({
    productId: v.id("products"),
    discountPercentage: v.number(),
    originalPrice: v.number(),
    discountedPrice: v.number(),
    platform: v.string(),
    url: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    upvotes: v.number(), // for community voting
    verified: v.boolean(), // staff verified
  }).index("by_platform_discount", ["platform", "discountPercentage"])
   .index("by_created_at", ["createdAt"]),
});
