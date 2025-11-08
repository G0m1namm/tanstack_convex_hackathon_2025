import { Trans } from '@lingui/react'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              <Trans id="landing.title" />
            </h1>
            <span className="ml-2 text-xs md:text-sm text-muted-foreground font-semibold">
              <Trans id="landing.beta" />
            </span>
          </div>

          {/* Navigation Links - Modern Style */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Trans id="nav.howItWorks" />
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Trans id="nav.pricing" />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button - can be expanded later */}
          <div className="md:hidden">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}
