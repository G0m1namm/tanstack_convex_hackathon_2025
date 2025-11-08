import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { LandingPage } from '../src/routes/index'

// Mock Convex client
const mockConvexClient = new ConvexReactClient('http://localhost:3210')

// Mock the useMutation hook
jest.mock('convex/react', () => ({
  useMutation: jest.fn(() => jest.fn()),
}))

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

    expect(screen.getByText('Find Cheaper Alternatives')).toBeInTheDocument()
    expect(screen.getByText('Instantly')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/paste product url/i)).toBeInTheDocument()
    expect(screen.getByText('Find Deals')).toBeInTheDocument()
  })

  it('shows supported platforms', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.getByText('eBay')).toBeInTheDocument()
    expect(screen.getByText('Walmart')).toBeInTheDocument()
  })

  it('has sample product buttons', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByText('📱 Sample iPhone')).toBeInTheDocument()
    expect(screen.getByText('🏠 Sample Home Item')).toBeInTheDocument()
  })

  it('shows how it works section', () => {
    renderWithProviders(<LandingPage />)

    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Paste URL')).toBeInTheDocument()
    expect(screen.getByText('AI Extraction')).toBeInTheDocument()
    expect(screen.getByText('Compare & Save')).toBeInTheDocument()
  })
})
