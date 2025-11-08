# DealFinder - Price Comparison Platform

## Project Overview

**DealFinder** is an AI-powered price comparison platform that helps users find cheaper alternatives to products across major e-commerce platforms like Amazon, eBay, Walmart, Best Buy, and Target.

### Core Features
- **Product URL Analysis**: Extract product information from any e-commerce URL
- **AI-Powered Search**: Use AI to understand products and find identical/similar items
- **Cross-Platform Comparison**: Compare prices across multiple retailers
- **Real-time Price Tracking**: Monitor price changes and availability
- **User-Friendly Interface**: Clean, modern React-based UI

### Tech Stack
- **Frontend**: React 19, TypeScript, TanStack Router, Tailwind CSS
- **Backend**: Convex (serverless database + functions)
- **AI/ML**: Autumn (pricing/billing), Firecrawl (web scraping)
- **Monitoring**: Sentry (error tracking)
- **Build Tools**: Vite, ESLint, TypeScript

## Development Guidelines

### Architecture Principles
- **Serverless First**: Leverage Convex for all backend operations
- **Type Safety**: Strict TypeScript usage throughout
- **Component-Driven**: Modular, reusable React components
- **Performance**: Optimize for fast loading and smooth UX

### Code Quality Standards
- **ESLint**: Follow all configured rules (including @typescript-eslint/no-explicit-any)
- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Testing**: Write tests for critical business logic
- **Documentation**: Comment complex business logic
- **Performance**: Optimize bundle size, use lazy loading for large components
- **Accessibility**: Follow WCAG guidelines with proper ARIA labels

### File Organization
```
├── convex/           # Backend functions and schema
│   ├── schema.ts     # Database schema definitions
│   ├── search.ts     # Product search logic
│   ├── autumn.ts     # Pricing/billing integration
│   └── myFunctions.ts # Legacy/misc functions
├── src/
│   ├── routes/       # TanStack Router pages
│   ├── AutumnWrapper.tsx # Pricing context provider
│   └── router.tsx    # Router configuration
└── public/           # Static assets
```

## AI Agent Instructions

### When Working on Features
1. **Understand the Domain**: Price comparison involves product matching, which is complex due to:
   - Product variations (colors, sizes, models)
   - Platform-specific data structures
   - Dynamic pricing and availability

2. **Database Schema Awareness**: Know the Convex schema structure:
   - `products`: Individual product data
   - `comparisons`: Search sessions and results
   - `searches`: User search analytics
   - `deals`: Community-discovered deals

3. **API Integration**: Be aware of external services:
   - **Firecrawl**: Web scraping for product data
   - **Autumn**: Subscription and pricing management
   - **Convex**: Real-time database and functions

### Development Workflow
1. **Start with Schema**: Define data models in `convex/schema.ts`
2. **Backend First**: Implement Convex functions before frontend
3. **Type Safety**: Generate types from Convex schema
4. **Test Locally**: Use Convex dev server for testing
5. **Error Handling**: Implement proper error boundaries and user feedback

### Common Patterns
- **URL Processing**: Validate and parse e-commerce URLs
- **Product Matching**: Use AI to determine product similarity
- **Price Comparison**: Handle currency conversion and discounts
- **User Experience**: Provide loading states and error messages

### Security Considerations
- **Input Validation**: Sanitize all user inputs, especially URLs
- **Rate Limiting**: Respect platform APIs and implement user limits
- **Data Privacy**: Handle user search data appropriately
- **API Keys**: Never expose sensitive credentials

## Technology-Specific Best Practices

### React 19 + TypeScript
- **React Compiler**: Leverage automatic optimization - avoid manual memoization unless necessary
- **Server Components**: Use 'use server' for data fetching and 'use client' for interactivity
- **Actions**: Use Server Actions for form submissions and data mutations instead of event handlers
- **New Hooks**: Utilize useOptimistic, useFormStatus, useFormState for enhanced UX
- **Functional Components**: Use hooks and functional components over class components
- **Component Composition**: Prefer composition over inheritance patterns
- **Type Safety**: Define proper interfaces for props and state with strict TypeScript
- **Error Boundaries**: Implement error boundaries with improved React 19 error handling
- **Suspense Integration**: Use Suspense boundaries for better loading states
- **Concurrent Features**: Leverage startTransition and useDeferredValue for responsiveness
- **Resource Loading**: Use React 19's new resource loading patterns for better performance

### TanStack Router
- **File-Based Routing**: Use descriptive route names (e.g., `compare.$comparisonId.tsx`)
- **Data Loading**: Use `createFileRoute().loader()` for server-side data fetching
- **Search Params**: Use `useSearch()` hook for URL query parameters
- **Navigation**: Use `useNavigate()` hook for programmatic navigation
- **Route Organization**: Group related routes in appropriate directories

### Convex Backend
- **Schema-First**: Always define database schema before implementing functions
- **Query Optimization**: Use appropriate indexes for frequently queried fields
- **Real-time Subscriptions**: Use subscriptions sparingly and unsubscribe when not needed
- **Error Handling**: Implement proper error handling for all database operations
- **Type Generation**: Run `npx convex dev` after schema changes to regenerate types

### Autumn (Pricing/Billing)
- **Customer Lifecycle**: Properly manage customer creation and subscription states
- **Feature Gating**: Use `allowed()` function for feature access control
- **Usage Tracking**: Call `track()` after successful usage to update limits
- **Error Handling**: Handle billing failures gracefully with user feedback
- **Product Management**: Keep pricing logic centralized in Autumn dashboard

### Firecrawl (Web Scraping)
- **Input Validation**: Validate URLs before scraping operations
- **Error Handling**: Implement retry logic and timeout handling
- **Rate Limiting**: Respect rate limits and implement backoff strategies
- **Data Sanitization**: Clean and validate scraped data before storage
- **Caching**: Cache successful scrapes to reduce redundant requests

### Tailwind CSS
- **Utility-First**: Use utility classes instead of custom CSS when possible
- **Responsive Design**: Use breakpoint prefixes (sm:, md:, lg:, xl:) consistently
- **Component Extraction**: Extract repeated patterns into reusable components
- **Performance**: Avoid excessive nesting and use @apply sparingly
- **Dark Mode**: Implement dark mode using Tailwind's dark: prefix

### Vite (Build Tool)
- **Plugin Optimization**: Only use necessary plugins and keep them lightweight
- **Build Performance**: Use explicit file extensions in imports to reduce resolve operations
- **Asset Handling**: Optimize images and use appropriate formats
- **Bundle Splitting**: Use dynamic imports for code splitting
- **Dev Server**: Configure warmup for frequently used files

### Vitest (Testing Framework)
- **Test Location**: Place tests in `__tests__/` directory with `.test.ts` or `.test.tsx` extensions
- **Test Helpers**: Place reusable test helper functions in `__tests__/test-helpers/` directory
- **Mocking**: Use `vi.mock()` and `vi.fn()` for mocking (not `jest.mock` or `jest.fn()`)
- **React Component Testing**: Use `@testing-library/react` with jsdom environment for component tests
- **Data-TestId Attributes**: Add `data-testid` attributes to important interactive elements using constants from `src/constants/constants.ts`
- **Configuration**: Tests configured in `vitest.config.ts` with globals enabled
- **Setup**: Global test setup in `__tests__/setup.ts`
- **Coverage**: Focus on critical business logic testing rather than 100% coverage

## Useful Commands

### Development
```bash
# Start development servers
pnpm dev          # Frontend (Vite)
npx convex dev    # Backend (Convex)

# Build for production
pnpm build        # Frontend build
npx convex deploy # Deploy backend

# Code quality
pnpm lint         # ESLint check
pnpm type-check   # TypeScript check
```

### Database Operations
```bash
# View data in Convex dashboard
npx convex dashboard

# Reset development database
npx convex dev --reset
```

### Testing
```bash
# Run tests with Vitest
pnpm test         # Watch mode
pnpm test:run     # Single run
pnpm test:ui      # Open Vitest UI

# Test specific functionality
npx convex run <function_name> --args '{"key": "value"}'
```

## React 19 Specific Guidelines for DealFinder

### Server Actions for Product Search
- **URL Processing**: Use Server Actions for URL validation and initial product extraction
- **Search Operations**: Implement optimistic updates with useOptimistic for search results
- **Error Handling**: Use React 19's improved error boundaries for search failures
- **Loading States**: Leverage Suspense for search loading states with better UX

### Client/Server Component Architecture
- **Server Components**: Use for static content like product comparison layouts
- **Client Components**: Use for interactive features like search forms and filters
- **Data Fetching**: Combine Server Components with Convex queries for optimal performance

## Best Practices for AI Agents

### Code Generation
- **Follow Existing Patterns**: Match the coding style and structure
- **TypeScript First**: Define interfaces and types before implementation
- **Error Handling**: Use try/catch blocks and provide meaningful error messages
- **Performance**: Consider bundle size and runtime performance

### Database Operations
- **Convex Queries**: Use `useSuspenseQuery` for data fetching
- **Mutations**: Use `useMutation` for data modifications
- **Real-time**: Leverage Convex subscriptions for live updates

### UI/UX Considerations
- **Responsive Design**: Ensure mobile compatibility
- **Loading States**: Always show loading indicators for async operations
- **Error States**: Provide clear error messages and recovery options
- **Accessibility**: Follow WCAG guidelines

### Debugging Tips
- **Convex Logs**: Check `npx convex logs` for backend errors
- **Browser DevTools**: Use React DevTools for component debugging
- **Network Tab**: Monitor API calls and responses
- **TypeScript Errors**: Fix type errors before runtime testing

Remember: This is a hackathon project focused on speed and innovation. Prioritize working functionality over perfect code, but maintain code quality standards.
