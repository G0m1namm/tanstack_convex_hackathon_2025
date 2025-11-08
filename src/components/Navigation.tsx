import { Trans } from '@lingui/react'
import { Link, useRouterState, useParams } from '@tanstack/react-router'
import { Search, Home, TrendingDown } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavigationProps {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  const routerState = useRouterState()
  const params = useParams({ strict: false })
  const currentPath = routerState.location.pathname
  const lang = (params.lang as string) || 'en'

  // Check if we're on the landing page
  const isLandingPage =
    currentPath === '/' ||
    currentPath === `/${lang}` ||
    currentPath === `/${lang}/`

  return (
    <nav
      className={`bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand - Clickable */}
          <Link
            to="/$lang"
            params={{ lang }}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              <Trans id="landing.title" />
            </h1>
            <span className="ml-2 text-xs md:text-sm text-muted-foreground font-semibold">
              <Trans id="landing.beta" />
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Show different links based on current page */}
            {!isLandingPage && (
              <Link
                to="/$lang"
                params={{ lang }}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Home className="w-4 h-4" strokeWidth={1.5} />
                <span>Home</span>
              </Link>
            )}

            {isLandingPage && (
              <>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  <Search className="w-4 h-4" strokeWidth={1.5} />
                  <Trans id="nav.howItWorks" />
                </a>
                <a
                  href="#features"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
                  <span>Features</span>
                </a>
              </>
            )}

            {/* Language Switcher */}
            <div className="flex items-center pl-4 border-l border-border">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-4">
            {!isLandingPage && (
              <Link
                to="/$lang"
                params={{ lang }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}
