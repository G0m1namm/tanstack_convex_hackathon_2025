import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Trans } from '@lingui/react'

import { api } from '../../convex/_generated/api'
import { LANDING_PAGE_TEST_IDS } from '@/constants/constants'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Spinner } from './ui/spinner'
import { HeroSection } from './HeroSection'
import { PartnersSection } from './PartnersSection'
import { Section } from './Section'
import { SocialLinks } from './SocialLinks'

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
    { name: 'eBay', logo: '💰', color: 'bg-purple-100 text-purple-800' },
    { name: 'Walmart', logo: '🏪', color: 'bg-purple-100 text-purple-800' },
    { name: 'Best Buy', logo: '📱', color: 'bg-purple-100 text-purple-800' },
    { name: 'Target', logo: '🎯', color: 'bg-red-100 text-red-800' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title={<Trans id="landing.mainHeading" />}
        subtitle={<Trans id="landing.subtitle" />}
      >
        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a product URL to find better deals..."
                className="h-12 text-base"
                disabled={isLoading}
                data-testid={LANDING_PAGE_TEST_IDS.PRODUCT_URL_INPUT}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              size="lg"
              variant="default"
              className="px-6"
              data-testid={LANDING_PAGE_TEST_IDS.FIND_DEALS_BUTTON}
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {<Trans id="landing.searching" />}
                </>
              ) : (
                <>🔍 {<Trans id="landing.findDeals" />}</>
              )}
            </Button>
          </form>
        </div>
      </HeroSection>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Supported Platforms */}
        <PartnersSection partners={supportedPlatforms} />

        {/* How it Works Section */}
        <Section
          id="how-it-works"
          title={<Trans id="landing.howItWorks.title" />}
          subtitle={<Trans id="landing.howItWorks.subtitle" />}
          data-testid={LANDING_PAGE_TEST_IDS.HOW_IT_WORKS_SECTION}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <span>🔗</span>
              </div>
              <h3 className="text-xl font-medium mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step1.title" />}
              </h3>
              <p className="text-base text-muted-foreground">
                {<Trans id="landing.howItWorks.step1.description" />}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <span>🤖</span>
              </div>
              <h3 className="text-xl font-medium mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step2.title" />}
              </h3>
              <p className="text-base text-muted-foreground">
                {<Trans id="landing.howItWorks.step2.description" />}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <span>💰</span>
              </div>
              <h3 className="text-xl font-medium mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step3.title" />}
              </h3>
              <p className="text-base text-muted-foreground">
                {<Trans id="landing.howItWorks.step3.description" />}
              </p>
            </div>
          </div>
        </Section>

        {/* Demo/Test Section */}
        <section className="bg-card rounded-lg border border-border p-8 mb-16">
          <div className="text-center">
            <h3 className="passkeys-h3 mb-4">
              {<Trans id="landing.demo.title" />}
            </h3>
            <p className="text-muted-foreground mb-6">
              {<Trans id="landing.demo.description" />}
            </p>
            <div
              className="flex flex-wrap justify-center gap-4 text-sm"
              data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_BUTTONS_CONTAINER}
            >
              <Button
                onClick={() => setUrl('https://www.amazon.com/dp/B08N5WRWNW')}
                variant="outline"
                size="sm"
                data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_IPHONE_BUTTON}
              >
                {<Trans id="landing.demo.sampleIphone" />}
              </Button>
              <Button
                onClick={() =>
                  setUrl('https://www.walmart.com/ip/example-product')
                }
                variant="outline"
                size="sm"
                data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_HOME_ITEM_BUTTON}
              >
                {<Trans id="landing.demo.sampleHomeItem" />}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-4">
            <SocialLinks />
            <div className="text-center text-muted-foreground text-sm">
              <p>{<Trans id="landing.footer" />}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
