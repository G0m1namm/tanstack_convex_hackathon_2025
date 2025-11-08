# DealFinder Future Features

This document outlines planned enhancements for DealFinder after the MVP is complete.

## 🔄 Continuous Price Monitoring (Firecrawl Observer Integration)

### Overview
Integrate [Firecrawl Observer](https://www.firecrawl.dev/blog/introducing-firecrawl-observer) to add continuous price tracking and real-time alerts to DealFinder.

### Why This Feature Matters
- **Current limitation**: DealFinder only provides one-time price comparisons
- **User pain point**: Users want to know when prices drop or items become available
- **Competitive advantage**: Continuous monitoring differentiates from other comparison tools

### Technical Benefits
- **Perfect stack alignment**: Both Firecrawl Observer and DealFinder use Firecrawl + Convex
- **Shared infrastructure**: Can leverage existing product schema and scraping logic
- **AI-powered insights**: Observer uses GPT-4o-mini to filter meaningful changes

### Implementation Roadmap

#### Phase 1: Database Schema Extensions
```typescript
// Add to convex/schema.ts
watchedProducts: defineTable({
  userId: v.id("users"), // Future user system
  productId: v.id("products"),
  alertPreferences: v.object({
    priceDropThreshold: v.optional(v.number()), // % drop to trigger alert
    availabilityAlerts: v.boolean(), // Notify when back in stock
    frequency: v.union(v.literal("immediate"), v.literal("daily"), v.literal("weekly"))
  }),
  createdAt: v.number(),
  lastCheckedAt: v.optional(v.number()),
  isActive: v.boolean(),
}).index("by_user_active", ["userId", "isActive"])
.index("by_product", ["productId"]),

priceHistory: defineTable({
  productId: v.id("products"),
  price: v.number(),
  currency: v.string(),
  availability: v.boolean(),
  recordedAt: v.number(),
  source: v.string(), // "observer" vs "search"
}).index("by_product_date", ["productId", "recordedAt"]),
```

#### Phase 2: Observer Integration
1. **Deploy Firecrawl Observer** alongside DealFinder
2. **Configure monitoring schedules** (every 1-4 hours for active watches)
3. **Set up webhooks** to receive change notifications from Observer
4. **Implement change processing** in Convex functions

#### Phase 3: User Interface
1. **"Watch Product" buttons** on comparison results
2. **Dashboard for managed watched items** (`/watched`)
3. **Alert preferences** modal
4. **Price history charts** showing trends over time

#### Phase 4: Notification System
1. **Email notifications** via Observer's built-in system
2. **In-app notifications** for logged-in users
3. **Webhook integrations** (Slack, Discord, etc.)

### API Integration Points

#### Observer Webhook Handler
```typescript
// convex/webhooks.ts (new file)
export const handleObserverWebhook = action({
  args: {
    productUrl: v.string(),
    changes: v.array(v.object({
      type: v.string(), // "price", "availability", "content"
      oldValue: v.any(),
      newValue: v.any(),
      significance: v.number(), // AI-determined importance
    })),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Find watched products for this URL
    // Update price history
    // Send notifications if thresholds met
  }
})
```

#### Watch Product Mutation
```typescript
// Add to convex/search.ts
export const watchProduct = mutation({
  args: {
    productId: v.id("products"),
    alertPreferences: v.object({...})
  },
  handler: async (ctx, args) => {
    // Create watch record
    // Configure Observer monitoring
  }
})
```

### User Experience Flow

1. **Discovery**: User finds a product they like via DealFinder search
2. **Watch**: Click "Watch for price drops" button
3. **Configure**: Set alert preferences (price drop %, availability, frequency)
4. **Monitor**: Observer automatically checks the product URL periodically
5. **Alert**: Receive notifications when conditions are met
6. **Review**: View price history and trends in dashboard

### Success Metrics
- **Watch conversion rate**: % of searches that result in product watches
- **Alert engagement**: How many alerts lead to purchases
- **User retention**: Increased return visits due to ongoing value
- **Revenue impact**: Premium subscriptions for advanced monitoring features

### Technical Considerations
- **Rate limiting**: Respect platform terms and Observer API limits
- **Data freshness**: Balance between real-time updates and API costs
- **Privacy**: Handle user data appropriately for notification preferences
- **Scalability**: Observer's serverless architecture should handle growth

### Dependencies
- [Firecrawl Observer](https://github.com/mendableai/firecrawl-observer) (open source)
- User authentication system (for personalized watches)
- Email service integration
- Notification preferences management

### Timeline Estimate
- **Phase 1 (Schema)**: 1-2 days
- **Phase 2 (Integration)**: 3-5 days
- **Phase 3 (UI)**: 5-7 days
- **Phase 4 (Notifications)**: 2-3 days
- **Total**: 2-3 weeks after MVP completion

### Risk Assessment
- **Low technical risk**: Builds on existing Firecrawl + Convex stack
- **Market validation needed**: Test user interest in paid monitoring features
- **Competition**: Several price tracking tools exist, differentiation needed

---

## Other Future Features

### 🤖 AI-Powered Product Matching
Enhance similarity detection using embeddings and vector search for better cross-platform product matching.

### 📊 Analytics Dashboard
User behavior analytics, popular products, price trends, and performance metrics.

### 🛒 Shopping Lists & Cart Sync
Save products for later, create shopping lists, and sync with e-commerce platforms.

### 💰 Deal Discovery Engine
Automatically find and highlight deals across monitored products and categories.

### 🌍 Multi-Region Support
Expand beyond US to EU, Asia-Pacific markets with localized platform support.
