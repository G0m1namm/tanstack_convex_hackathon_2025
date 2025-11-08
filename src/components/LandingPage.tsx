import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Trans } from '@lingui/react'

import { api } from '../../convex/_generated/api'
import { LANDING_PAGE_TEST_IDS } from '@/constants/constants'
import { LanguageSwitcher } from './LanguageSwitcher'

export function LandingPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()


  // We'll create this mutation later
  const createSearch = useMutation(api.search.createSearch)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // Create search record and navigate to search page
      const searchId = await createSearch({
        url: url.trim(),
        successful: false, // Will be updated when search completes
      })

      // Navigate to search page with the URL as query param
      navigate({
        to: '/search',
        search: { url: url.trim(), searchId },
      })
    } catch (error) {
      console.error('Failed to create search:', error)
      setIsLoading(false)
    }
  }

  const supportedPlatforms = [
    { name: 'Amazon', logo: '🛒', color: 'bg-orange-100 text-orange-800' },
    { name: 'eBay', logo: '💰', color: 'bg-blue-100 text-blue-800' },
    { name: 'Walmart', logo: '🏪', color: 'bg-blue-100 text-blue-800' },
    { name: 'Best Buy', logo: '📱', color: 'bg-blue-100 text-blue-800' },
    { name: 'Target', logo: '🎯', color: 'bg-red-100 text-red-800' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900"><Trans id="landing.title" /></h1>
              <span className="ml-2 text-sm text-gray-500"><Trans id="landing.beta" /></span>
            </div>
            <div className="flex items-center space-x-8">
              <nav className="flex space-x-8">
                <a href="#how-it-works" className="text-gray-500 hover:text-gray-900"><Trans id="nav.howItWorks" /></a>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900"><Trans id="nav.pricing" /></a>
              </nav>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" data-testid={LANDING_PAGE_TEST_IDS.MAIN_HEADING}>
            <Trans id="landing.mainHeading" />
            <span className="block text-indigo-600"><Trans id="landing.mainHeadingAccent" /></span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            <Trans id="landing.subtitle" />
          </p>

          {/* URL Input Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={<Trans id="landing.urlPlaceholder" />}
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                  data-testid={LANDING_PAGE_TEST_IDS.PRODUCT_URL_INPUT}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                data-testid={LANDING_PAGE_TEST_IDS.FIND_DEALS_BUTTON}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {<Trans id="landing.searching" />}
                  </>
                ) : (
                  <>
                    🔍 {<Trans id="landing.findDeals" />}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Supported Platforms */}
          <div className="mb-16" data-testid={LANDING_PAGE_TEST_IDS.SUPPORTED_PLATFORMS}>
            <p className="text-sm text-gray-500 mb-4">{<Trans id="landing.supportedPlatforms" />}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {supportedPlatforms.map((platform) => (
                <span
                  key={platform.name}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${platform.color}`}
                >
                  <span className="mr-1">{platform.logo}</span>
                  {platform.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16" data-testid={LANDING_PAGE_TEST_IDS.HOW_IT_WORKS_SECTION}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{<Trans id="landing.howItWorks.title" />}</h2>
            <p className="text-lg text-gray-600">{<Trans id="landing.howItWorks.subtitle" />}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{<Trans id="landing.howItWorks.step1.title" />}</h3>
              <p className="text-gray-600">
                {<Trans id="landing.howItWorks.step1.description" />}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{<Trans id="landing.howItWorks.step2.title" />}</h3>
              <p className="text-gray-600">
                {<Trans id="landing.howItWorks.step2.description" />}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{<Trans id="landing.howItWorks.step3.title" />}</h3>
              <p className="text-gray-600">
                {<Trans id="landing.howItWorks.step3.description" />}
              </p>
            </div>
          </div>
        </section>

        {/* Demo/Test Section */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{<Trans id="landing.demo.title" />}</h3>
            <p className="text-gray-600 mb-6">
              {<Trans id="landing.demo.description" />}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm" data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_BUTTONS_CONTAINER}>
              <button
                onClick={() => setUrl('https://www.amazon.com/dp/B08N5WRWNW')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_IPHONE_BUTTON}
              >
{<Trans id="landing.demo.sampleIphone" />}
              </button>
              <button
                onClick={() => setUrl('https://www.walmart.com/ip/example-product')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_HOME_ITEM_BUTTON}
              >
{<Trans id="landing.demo.sampleHomeItem" />}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>{<Trans id="landing.footer" />}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
