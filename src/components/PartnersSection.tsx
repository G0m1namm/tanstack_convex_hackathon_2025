import { Trans } from '@lingui/react'
import { LANDING_PAGE_TEST_IDS } from '@/constants/constants'

interface Partner {
  name: string
  logo: string
  color: string
}

interface PartnersSectionProps {
  partners: Partner[]
  title?: string
  className?: string
}

export function PartnersSection({
  partners,
  title,
  className = ''
}: PartnersSectionProps) {
  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12">
            <p className="text-sm text-gray-500 mb-4">{title}</p>
          </div>
        )}

        {/* Partners Grid - Firecrawl Style */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
          data-testid={LANDING_PAGE_TEST_IDS.SUPPORTED_PLATFORMS}
        >
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-3xl">
                {partner.logo}
              </div>
              <span className="text-sm font-medium text-center" style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}>
                {partner.name}
              </span>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            <Trans id="landing.supportedPlatforms" />
          </p>
        </div>
      </div>
    </section>
  )
}
