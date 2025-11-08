# DealFinder Development Guide

## Quick Start

### Development Setup
```bash
# Start frontend
pnpm dev

# Start backend (separate terminal)
npx convex dev

# Run linter
pnpm lint

# Run tests
pnpm test
```

---

## Tech Stack

### Frontend
- **React 19** - Latest features (Server Components, Actions, new hooks)
- **TypeScript** - Strict mode enabled
- **TanStack Router** - File-based routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system
- **Vite** - Build tool

### Backend
- **Convex** - Serverless database + functions
- **Firecrawl** - Web scraping
- **Autumn** - Pricing/billing

### Testing
- **Vitest** - Test runner
- **@testing-library/react** - Component testing

---

## Project Structure

```
convex/                  # Backend functions
├── schema.ts           # Database schema
├── search.ts           # Search logic
├── autumn.ts           # Billing integration
└── firecrawlActions.ts # Web scraping

src/
├── routes/             # TanStack Router pages
│   ├── __root.tsx      # Root layout
│   ├── $lang/          # Internationalized routes
│   └── *.tsx           # Page components
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   └── *.tsx           # Custom components
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── styles/
│   └── app.css         # Global styles & theme
└── constants/          # App constants

__tests__/              # Test files
└── test-helpers/       # Test utilities
```

---

## React 19 Best Practices

### Use Server Components
```tsx
// Automatic optimization, no manual memoization needed
export default function Page() {
  // Fetch data directly
  const data = await fetchData()
  return <div>{data}</div>
}
```

### Use Server Actions for Forms
```tsx
'use server'

export async function submitForm(formData: FormData) {
  // Process data
  return { success: true }
}
```

### New Hooks
```tsx
import { useOptimistic, useFormStatus, useFormState } from 'react'

// Optimistic updates
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)

// Form status
const { pending } = useFormStatus()

// Form state
const [state, formAction] = useFormState(serverAction, initialState)
```

---

## Convex Backend

### Query Pattern
```tsx
// In component
import { useSuspenseQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

function Component() {
  const data = useSuspenseQuery(api.search.getResults, { id: "123" })
  return <div>{data.name}</div>
}
```

### Mutation Pattern
```tsx
import { useMutation } from 'convex/react'

function Component() {
  const createSearch = useMutation(api.search.create)
  
  const handleClick = async () => {
    await createSearch({ url: "https://..." })
  }
  
  return <button onClick={handleClick}>Search</button>
}
```

### Schema Definition
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.number(),
    url: v.string(),
    platform: v.string(),
  }).index("by_platform", ["platform"]),
})
```

---

## TanStack Router

### File-Based Routes
```
routes/
├── index.tsx                    → /
├── search.tsx                   → /search
├── compare.$comparisonId.tsx    → /compare/:comparisonId
└── $lang.index.tsx              → /:lang
```

### Route Component Pattern
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  const { url } = Route.useSearch() // Query params
  const navigate = Route.useNavigate() // Navigation
  
  return <div>Search for: {url}</div>
}
```

---

## Styling with Tailwind

### Design System Usage
```tsx
import { CheckCircle2, Zap } from 'lucide-react'

// Dark theme card
<div className="bg-card/50 border border-border/50 backdrop-blur-sm rounded-lg p-6">
  <h2 className="text-foreground text-lg font-semibold mb-2">
    Title
  </h2>
  <p className="text-muted-foreground">
    Description
  </p>
</div>

// Status badge
<Badge className="bg-green-900/30 text-green-300 border border-green-800/50">
  <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={1.5} />
  Success
</Badge>
```

### Custom CSS Variables
All theme colors are defined in `src/styles/app.css` - use CSS variables for consistency:
```css
color: var(--foreground);
background: var(--background);
border-color: var(--border);
```

---

## Testing

### Component Test Example
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Component from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByTestId('my-element')).toBeInTheDocument()
  })
})
```

### Use Test IDs
Add `data-testid` attributes from constants:
```tsx
import { TEST_IDS } from '@/constants'

<button data-testid={TEST_IDS.SEARCH_BUTTON}>Search</button>
```

### Run Tests
```bash
pnpm test        # Watch mode
pnpm test:run    # Single run
pnpm test:ui     # Open Vitest UI
```

---

## Code Quality

### TypeScript Rules
- ✅ Strict mode enabled
- ❌ No `any` types allowed
- ✅ Define proper interfaces for props and state
- ✅ Use type inference where possible

### ESLint Rules
- Follow all configured rules
- Fix errors before committing
- Run `pnpm lint` regularly

### Best Practices
```tsx
// ✅ Good: Typed props
interface Props {
  name: string
  count: number
}

function Component({ name, count }: Props) {
  return <div>{name}: {count}</div>
}

// ❌ Bad: Untyped props
function Component(props) {
  return <div>{props.name}: {props.count}</div>
}
```

---

## Common Patterns

### Error Handling
```tsx
try {
  const result = await someOperation()
  // Handle success
} catch (error) {
  console.error('Operation failed:', error)
  // Show user-friendly error message
}
```

### Loading States
```tsx
const [loading, setLoading] = useState(false)

if (loading) {
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 animate-spin text-primary" />
      <span className="text-muted-foreground">Loading...</span>
    </div>
  )
}
```

### Conditional Rendering
```tsx
// Ternary for inline
{isLoading ? <Spinner /> : <Content />}

// Early return for complex logic
if (error) return <ErrorState error={error} />
if (loading) return <LoadingState />
return <SuccessState data={data} />
```

---

## Internationalization (i18n)

### Using Translations
```tsx
import { Trans } from '@lingui/react'

function Component() {
  return (
    <div>
      <Trans id="search.title" />
      <Trans id="search.results" values={{ count: 5 }} />
    </div>
  )
}
```

### Adding Translations
1. Add keys to `public/locales/en/messages.po`
2. Add corresponding translations in `public/locales/es/messages.po`
3. Run `pnpm lingui:extract` to update

---

## Performance Tips

### Code Splitting
```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Image Optimization
- Use appropriate formats (WebP, AVIF)
- Set explicit width/height
- Use lazy loading

### Convex Query Optimization
- Use appropriate indexes in schema
- Unsubscribe when components unmount
- Use pagination for large datasets

---

## Deployment

### Build for Production
```bash
# Build frontend
pnpm build

# Deploy backend
npx convex deploy
```

### Environment Variables
- Store secrets in Convex dashboard
- Use `.env.local` for local development
- Never commit sensitive data

---

## Troubleshooting

### Common Issues

**TypeScript Errors**
```bash
# Regenerate types
npx convex dev
```

**Linting Errors**
```bash
# Auto-fix where possible
pnpm lint --fix
```

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

**Convex Connection Issues**
```bash
# Reset dev environment
npx convex dev --reset
```

---

## Resources

### Documentation
- [React 19 Docs](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Convex Docs](https://docs.convex.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### Project-Specific
- **Design System**: See `DESIGN_SYSTEM.md`
- **Component Examples**: See `src/components/SearchPage.tsx`, `src/components/ComparisonPage.tsx`

---

## Getting Help

1. Check documentation files in project root
2. Review reference components in `src/components/`
3. Check Convex logs: `npx convex logs`
4. Use browser DevTools for frontend debugging
5. Check TypeScript errors in IDE

