# DealFinder - Black Friday Deal Comparison App

A full-stack web application built for the TanStack Start Hackathon that helps users find cheaper alternatives to products across e-commerce platforms.

## 🏗️ Tech Stack

- **Frontend**: TanStack Start (React + TanStack Router + SSR)
- **Backend**: Convex (real-time database + serverless functions)
- **Scraping**: Firecrawl (product data extraction)
- **Billing**: Autumn (subscription management)
- **Monitoring**: Sentry (error tracking)
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- **Node.js 22** (required for Convex Node.js actions)
- **pnpm** package manager

### Node.js Version Setup

This project requires Node.js 22.13.1 for Convex's Node.js runtime support. The project includes an `.nvmrc` file and custom dev script that automatically switches to the correct version:

```bash
# Install Node.js 22 if not already installed
nvm install 22.13.1
nvm use 22.13.1

# Verify version
node --version  # Should show v22.13.1
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers (automatically uses correct Node version)
pnpm dev
```

The `dev.sh` script automatically loads nvm and switches to Node.js 22.13.1 before starting the development servers.

## 🚀 Core Features

### ✅ IMPLEMENTED (Current Status)
- **Landing Page**: Professional UI with URL input, platform badges, how-it-works section
- **Database Schema**: Complete Convex schema for products, comparisons, searches, deals
- **Search Functions**: Convex mutations and actions for product extraction and comparison
- **Search Route**: Loading page with progress indicators during processing
- **Results Route**: Price comparison display with sorting and savings calculations
- **Basic Routing**: TanStack Router setup with search params and dynamic routes

### 🔄 MVP Features (Next Steps)
- **URL Input & Validation**: Form validation and error handling
- **Product Extraction**: Integrate Firecrawl API for real product data
- **Cross-Platform Search**: Implement actual multi-platform product matching
- **Price Comparison**: Enhanced sorting and filtering options
- **Real-time Updates**: Live price updates via Convex subscriptions

### Future Features
- **Community Deals**: User-submitted deals with voting
- **Price Tracking**: Alerts for price drops

## 💰 Monetization Strategy (Autumn Integration)

### Subscription Tiers

#### **Free Tier** (Always Free)
- **10 searches per day**
- **Basic price comparison** (up to 3 platforms)
- **Community deal access**
- **Email support**
- **Usage tracking via Autumn**

#### **Pro Tier** ($9.99/month)
- **Unlimited searches**
- **All 5+ platforms** (Amazon, eBay, Walmart, Best Buy, Target + more)
- **Priority search processing**
- **Price tracking alerts** (email notifications)
- **Advanced filtering** (brand, category, price range)
- **Export comparison data**
- **Priority customer support**
- **Bulk product comparison** (CSV upload)
- **API access** (500 requests/month)
- **Advanced analytics** (search trends, savings reports)

### Autumn Implementation Plan

#### Phase 1: Basic Subscription (Hackathon Demo)
```typescript
// Basic subscription check
const userSubscription = await autumn.getSubscription(userId)

if (userSubscription.tier === 'free' && searchCount >= 10) {
  throw new Error('Daily limit exceeded. Upgrade to Pro!')
}

// Track usage
await autumn.recordUsage(userId, 'search', 1)
```

#### Phase 2: Advanced Features
- **Usage Analytics**: Track popular products, peak usage times
- **Revenue Analytics**: Subscription metrics, conversion rates
- **A/B Testing**: Test different pricing strategies
- **Promotional Codes**: Referral discounts, seasonal offers

### Pricing Strategy

#### Freemium Model
- **Conversion Goal**: 5-10% of free users convert to paid
- **Value Demonstration**: First 10 searches prove the value
- **Upgrade Triggers**: Daily limit reached, advanced features needed

#### Revenue Projections
- **Month 1-3**: Focus on user acquisition (free tier growth)
- **Month 3-6**: Optimize conversion rate (A/B test pricing)
- **Month 6+**: Scale paid subscriptions (focus on Pro tier growth)

### Autumn Technical Integration

#### Environment Setup
```env
AUTUMN_API_KEY=your_autumn_api_key
AUTUMN_WEBHOOK_SECRET=your_webhook_secret
```

#### Webhook Handling
```typescript
// Handle subscription changes
app.post('/webhooks/autumn', (req, res) => {
  const { event, data } = req.body

  if (event === 'subscription.updated') {
    // Update user permissions
    await updateUserTier(data.userId, data.tier)
  }

  res.sendStatus(200)
})
```

#### Usage Tracking
```typescript
// Track searches per user
export const trackSearchUsage = async (userId: string) => {
  await autumn.recordEvent({
    userId,
    event: 'search_performed',
    metadata: {
      timestamp: Date.now(),
      source: 'web'
    }
  })
}
```

### Business Metrics to Track

#### User Acquisition
- **Free Signups**: Total free tier registrations
- **Conversion Rate**: Free to paid conversion percentage
- **CAC**: Customer acquisition cost

#### Engagement
- **Daily Active Users**: Users performing searches
- **Search Frequency**: Average searches per user
- **Platform Usage**: Most popular e-commerce platforms

#### Revenue
- **MRR**: Monthly recurring revenue
- **ARPU**: Average revenue per user
- **Churn Rate**: Subscription cancellation rate

### Success Milestones

#### Month 1: Foundation
- ✅ 100 free users
- ✅ Autumn integration complete
- ✅ Basic subscription flow working

#### Month 3: Growth
- ✅ 1,000 free users
- ✅ 5% conversion rate
- ✅ $450 MRR (45 Pro subscribers × $9.99)

#### Month 6: Scale
- ✅ 10,000 free users
- ✅ 8% conversion rate
- ✅ $7,200 MRR (720 Pro subscribers × $9.99)

#### Year 1: Maturity
- ✅ 50,000 free users
- ✅ 10% conversion rate
- ✅ $45,000 MRR (4,500 Pro subscribers × $9.99)

## 📁 Project Structure

```
src/
├── routes/
│   ├── index.tsx          # Landing page
│   ├── search.tsx         # Search/loading page
│   ├── compare.$id.tsx    # Results page
│   └── product.$id.tsx    # Product details page
├── components/            # Reusable UI components
└── styles/               # Global styles

convex/
├── schema.ts             # Database schema
├── search.ts             # Search & product functions
└── myFunctions.ts        # Legacy functions
```

## 🗄️ Database Schema

### Tables
- `products`: Extracted product information
- `comparisons`: Search sessions and results
- `searches`: Analytics and search tracking
- `deals`: Community deals (future)

### Key Relationships
- `comparisons` → `products` (many-to-many)
- `searches` → `comparisons` (one-to-one)

## 🔄 User Flow

1. **Landing** → User pastes product URL
2. **Search** → Extract product data + search alternatives
3. **Compare** → View price comparison results
4. **Purchase** → Direct links to stores

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Deploy Convex functions
npx convex dev --once
```

## 🚀 Deployment

- **Frontend**: Netlify (SSR support)
- **Backend**: Convex (global deployment)
- **Database**: Convex (managed)

## 📊 Hackathon Strategy

### Judging Criteria Focus
- ✅ TanStack Start utilization (streaming, server functions, routing)
- ✅ Convex integration (real-time features, data modeling)
- ✅ Firecrawl integration (product extraction)
- ✅ Autumn integration (billing infrastructure)
- ✅ Code quality & creativity

### Winning Elements
- Real-time price updates via Convex subscriptions
- Streaming SSR with TanStack Start
- Comprehensive multi-platform support
- Production-ready error handling and monitoring

## 🎯 Success Metrics

- **Technical**: 95% product extraction success rate
- **User**: 50+ successful comparisons in first week
- **Business**: Clear monetization path with Autumn integration

## 🏗️ Implementation Details

### Current Architecture
```
Landing Page (/) → Search Page (/search?url=...) → Results Page (/compare/$id)
     ↓                    ↓                              ↓
  Form Submit      Extract Product → Search Similar   Display Comparison
  Validation       (Mock Data)     → (Mock Results)   (Price Sorting)
```

### User Flow Status
1. ✅ **Landing**: Professional UI with sample URLs and platform badges
2. 🔄 **Search**: Basic flow with progress indicators (uses mock data)
3. ✅ **Results**: Comparison display with price sorting and savings calculation
4. ❌ **Details**: Individual product pages (not implemented yet)

### Mock Data Strategy
- Currently uses hardcoded mock data for development
- Firecrawl integration placeholder ready for real implementation
- Convex schema supports full product data structure

## 📝 API Documentation

### Convex Functions (`convex/search.ts`)

#### Mutations
- `createSearch`: Log search attempts with user agent and IP tracking
- `updateSearchSuccess`: Update search status and link to comparison
- `extractProduct`: Store complete product data from extraction
- `createComparison`: Initialize comparison session
- `updateComparison`: Update comparison with results or errors

#### Queries
- `getComparison`: Retrieve comparison with all product data

#### Actions
- `extractProductFromUrl`: Extract product via Firecrawl (mock implementation)
- `searchSimilarProducts`: Find alternatives across platforms (mock implementation)

### Route Structure
- `/` - LandingPage (URL input)
- `/search` - SearchPage (processing with search params)
- `/compare/$comparisonId` - ComparisonPage (results display)

### Data Flow
1. User submits URL → `createSearch` → Navigate to `/search`
2. Search page → `extractProductFromUrl` → `createComparison`
3. Comparison → `searchSimilarProducts` → Navigate to `/compare/$id`
4. Results page → `getComparison` → Display sorted products

## 🔐 Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-name
VITE_CONVEX_URL=your-convex-url

# Firecrawl
FIRECRAWL_API_KEY=your-api-key

# Autumn
AUTUMN_API_KEY=your-api-key

# Sentry
SENTRY_DSN=your-dsn
```

## 📈 Roadmap

### Phase 1 (Hackathon): Core MVP ✅
- Basic product comparison
- 3-5 platform support
- Real-time updates

### Phase 2: Enhanced Features
- Advanced product matching algorithms
- Price history tracking
- Email/SMS alerts

### Phase 3: Monetization
- Subscription tiers
- Analytics dashboard
- API for developers

## 📚 Documentation

### Essential Guides
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design system reference
  - Color palette & theme variables
  - Icon system (Lucide React)
  - Component patterns & styles
  - Typography & layout standards
  - Quick reference for dark theme

- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Developer handbook
  - Tech stack overview
  - Project structure
  - React 19 best practices
  - Convex backend patterns
  - TanStack Router usage
  - Testing guidelines
  - Deployment instructions

- **[AGENTS.md](./AGENTS.md)** - AI agent workspace rules
  - Project architecture principles
  - Development workflow
  - Code quality standards
  - Technology-specific guidelines

- **[FUTURE_FEATURES.md](./FUTURE_FEATURES.md)** - Roadmap and ideas
  - Planned enhancements
  - Feature wishlist
  - Integration opportunities

### Reference Components
For implementation examples, see:
- `src/components/SearchPage.tsx` - Loading states, progress indicators
- `src/components/ComparisonPage.tsx` - Cards, badges, stat displays
- `src/components/LandingPage.tsx` - Hero sections, platform cards

## 🤝 Contributing

Built for the TanStack Start Hackathon 2025. Focus on demonstrating:
- TanStack Start advanced features
- Convex real-time capabilities
- Multi-platform integrations
- Production-ready architecture
