import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Trans } from '@lingui/react'
import {
  ShoppingCart,
  Package,
  Building2,
  Smartphone,
  Target,
  Link2,
  Zap,
  TrendingDown,
  Search,
} from 'lucide-react'

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
    { name: 'Amazon', icon: ShoppingCart },
    { name: 'eBay', icon: Package },
    { name: 'Walmart', icon: Building2 },
    { name: 'Best Buy', icon: Smartphone },
    { name: 'Target', icon: Target },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-secondary/5">
      {/* Hero Section */}
      <HeroSection
        title={<Trans id="landing.mainHeading" />}
        subtitle={<Trans id="landing.subtitle" />}
        className="relative overflow-hidden py-32 md:py-40"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* URL Input Form */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 flex-col sm:flex-row"
          >
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a product URL to find better deals..."
                className="h-14 text-base rounded-lg shadow-lg border-primary/20 hover:border-primary/40 focus:border-primary transition-colors"
                disabled={isLoading}
                data-testid={LANDING_PAGE_TEST_IDS.PRODUCT_URL_INPUT}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              size="lg"
              variant="default"
              className="px-8 h-14 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              data-testid={LANDING_PAGE_TEST_IDS.FIND_DEALS_BUTTON}
            >
              {isLoading ? (
                <>
                  <Spinner className="h-5 w-5 mr-2" />
                  {<Trans id="landing.searching" />}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {<Trans id="landing.findDeals" />}
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Try pasting a link from Amazon, eBay, Walmart, Best Buy, or Target
          </p>
        </div>
      </HeroSection>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Supported Platforms [001] */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-widest text-center">
            [001. Supported Platforms]
          </p>
          <PartnersSection partners={supportedPlatforms} />
        </div>

        {/* How it Works Section [002] */}
        <Section
          id="how-it-works"
          title={<Trans id="landing.howItWorks.title" />}
          subtitle={<Trans id="landing.howItWorks.subtitle" />}
          data-testid={LANDING_PAGE_TEST_IDS.HOW_IT_WORKS_SECTION}
          className="py-20"
          containerClassName="text-center"
          sectionNumber="002"
        >
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="group p-8 rounded-xl border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Link2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step1.title" />}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {<Trans id="landing.howItWorks.step1.description" />}
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step2.title" />}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {<Trans id="landing.howItWorks.step2.description" />}
              </p>
            </div>

            <div className="group p-8 rounded-xl border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-20 h-20 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingDown
                  className="w-10 h-10 text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {<Trans id="landing.howItWorks.step3.title" />}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {<Trans id="landing.howItWorks.step3.description" />}
              </p>
            </div>
          </div>
        </Section>

        {/* Demo/Test Section [003] */}
        <section className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-12 mb-20">
          <div className="text-center">
            <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
              [003. Try It Now]
            </p>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {<Trans id="landing.demo.title" />}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
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
                className="px-6 py-2 rounded-lg hover:bg-primary/10 hover:border-primary transition-all"
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
                className="px-6 py-2 rounded-lg hover:bg-primary/10 hover:border-primary transition-all"
                data-testid={LANDING_PAGE_TEST_IDS.SAMPLE_HOME_ITEM_BUTTON}
              >
                {<Trans id="landing.demo.sampleHomeItem" />}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
