import { Trans } from '@lingui/react'
import type { ComponentType } from 'react'
import { LANDING_PAGE_TEST_IDS } from '@/constants/constants'

interface Partner {
  name: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
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
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{title}</p>
          </div>
        )}

        {/* Partners Grid - Modern Style */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          data-testid={LANDING_PAGE_TEST_IDS.SUPPORTED_PLATFORMS}
        >
          {partners.map((partner) => {
            const IconComponent = partner.icon
            return (
              <div
                key={partner.name}
                className="group flex flex-col items-center justify-center p-6 bg-card/50 hover:bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-center text-foreground">
                  {partner.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Subtitle */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            <Trans id="landing.supportedPlatforms" />
          </p>
        </div>
      </div>
    </section>
  )
}
