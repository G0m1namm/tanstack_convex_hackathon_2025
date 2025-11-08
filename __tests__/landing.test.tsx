import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { vi } from 'vitest'
import { LandingPage } from '../src/routes/index'
import { LANDING_PAGE_TEST_IDS } from '../src/constants/constants'

// Mock Convex client
const mockConvexClient = new ConvexReactClient('http://localhost:3210')

// Mock the convex/react module
vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react')
  return {
    ...actual,
    useMutation: vi.fn(() => vi.fn()),
  }
})

describe('LandingPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <ConvexProvider client={mockConvexClient}>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </ConvexProvider>
    )
  }

  it('renders the landing page with main elements', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.MAIN_HEADING)).toBeInTheDocument()
    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.PRODUCT_URL_INPUT)).toBeInTheDocument()
    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.FIND_DEALS_BUTTON)).toBeInTheDocument()
  })

  it('shows supported platforms', () => {
    renderWithProviders(<LandingPage />)

    const platformsContainer = screen.getByTestId(LANDING_PAGE_TEST_IDS.SUPPORTED_PLATFORMS)
    expect(platformsContainer).toBeInTheDocument()
    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.getByText('eBay')).toBeInTheDocument()
    expect(screen.getByText('Walmart')).toBeInTheDocument()
  })

  it('has sample product buttons', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.SAMPLE_BUTTONS_CONTAINER)).toBeInTheDocument()
    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.SAMPLE_IPHONE_BUTTON)).toBeInTheDocument()
    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.SAMPLE_HOME_ITEM_BUTTON)).toBeInTheDocument()
  })

  it('shows how it works section', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByTestId(LANDING_PAGE_TEST_IDS.HOW_IT_WORKS_SECTION)).toBeInTheDocument()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('1. Paste URL')).toBeInTheDocument()
    expect(screen.getByText('2. AI Extraction')).toBeInTheDocument()
    expect(screen.getByText('3. Compare & Save')).toBeInTheDocument()
  })
})
