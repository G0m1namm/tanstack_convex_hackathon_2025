import { LANDING_PAGE_TEST_IDS } from '@/constants/constants'
import { type ReactNode } from 'react'

interface HeroSectionProps {
  title: ReactNode
  subtitle: ReactNode
  children?: ReactNode
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  children,
  className = ''
}: HeroSectionProps) {
  return (
    <section className={`hero-section py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading with Passkeys-style Typography */}
          <h1
            className="passkeys-h1 mb-6 leading-tight"
            data-testid={LANDING_PAGE_TEST_IDS.MAIN_HEADING}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* Additional Content (forms, buttons, etc.) */}
          {children}
        </div>
      </div>
    </section>
  )
}
