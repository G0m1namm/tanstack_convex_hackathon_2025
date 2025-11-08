import { Trans } from '@lingui/react'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-medium" style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}>
              <Trans id="landing.title" />
            </h1>
            <span className="ml-2 text-sm text-gray-500">
              <Trans id="landing.beta" />
            </span>
          </div>

          {/* Navigation Links - Firecrawl Style */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}
              >
                <Trans id="nav.howItWorks" />
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}
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
