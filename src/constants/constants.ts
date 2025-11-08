// Application constants - central location for all constants
// Includes test ID constants for reliable component testing
// Centralizes all data-testid values to prevent typos and enable easy refactoring

// Test ID constants for components

export const LANDING_PAGE_TEST_IDS = {
  MAIN_HEADING: 'main-heading',
  PRODUCT_URL_INPUT: 'product-url-input',
  FIND_DEALS_BUTTON: 'find-deals-button',
  SUPPORTED_PLATFORMS: 'supported-platforms',
  SAMPLE_BUTTONS_CONTAINER: 'sample-buttons-container',
  SAMPLE_IPHONE_BUTTON: 'sample-iphone-button',
  SAMPLE_HOME_ITEM_BUTTON: 'sample-home-item-button',
  HOW_IT_WORKS_SECTION: 'how-it-works-section',
} as const

// Type for LandingPage test IDs
export type LandingPageTestIds = typeof LANDING_PAGE_TEST_IDS

// Future test ID constants for other components can be added here
// export const SEARCH_PAGE_TEST_IDS = { ... } as const
// export const COMPARISON_PAGE_TEST_IDS = { ... } as const
