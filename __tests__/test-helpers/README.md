# Test Helpers

This directory contains reusable helper functions and utilities for testing.

## Organization

- **`firecrawlHelpers.ts`**: Helper functions for testing firecrawl-related functionality
  - `detectPlatformFromUrl()`: Detect e-commerce platform from URL
  - `buildPlatformSearchQuery()`: Build platform-specific search queries
  - `extractPriceFromSnippet()`: Extract price from text snippets
  - `isProductUrl()`: Check if URL is a product page

## Data-TestId Best Practices

When adding `data-testid` attributes to components, follow these guidelines:

### Centralized Constants
- **Always use constants** from `src/constants/constants.ts` instead of hardcoded strings
- **Import test IDs** at the top of components: `import { COMPONENT_TEST_IDS } from '../constants'`
- **Use constants in JSX**: `data-testid={COMPONENT_TEST_IDS.BUTTON_NAME}`

### Naming Convention
- Use SCREAMING_SNAKE_CASE for constant names: `MAIN_HEADING`, `SUBMIT_BUTTON`
- Be descriptive but concise: `USER_PROFILE_CARD` vs `CARD`
- Group by component/page: `LANDING_PAGE_TEST_IDS`, `SEARCH_PAGE_TEST_IDS`

### When to Add data-testid
- **Interactive elements**: Buttons, links, form inputs
- **Important containers**: Sections, modals, navigation
- **Dynamic content**: Lists, tables, repeated elements
- **Elements tested in E2E**: Critical user journey elements

### Example Usage
```tsx
// constants/constants.ts
export const LANDING_PAGE_TEST_IDS = {
  SUBMIT_BUTTON: 'submit-button',
  USER_INPUT: 'user-input',
} as const

// Component
import { LANDING_PAGE_TEST_IDS } from '../constants'

function MyComponent() {
  return (
    <button data-testid={LANDING_PAGE_TEST_IDS.SUBMIT_BUTTON}>
      Submit
    </button>
  )
}

// Test
import { LANDING_PAGE_TEST_IDS } from '../src/constants/testIds'

expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.SUBMIT_BUTTON)).toBeInTheDocument()
```

## Guidelines

- Place helper functions that are used across multiple test files here
- Keep helper functions focused and well-documented
- Use descriptive names that indicate their testing purpose
- Import helpers in test files using relative paths: `import { helperName } from './test-helpers/fileName'`