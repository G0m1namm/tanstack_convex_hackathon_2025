import { useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Trans } from '@lingui/react'
import {
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Package,
  Building2,
  Smartphone,
  Target as TargetIcon,
} from 'lucide-react'

import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

// Platform icon mapping
const platformIcons: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  amazon: ShoppingCart,
  ebay: Package,
  walmart: Building2,
  bestbuy: Smartphone,
  target: TargetIcon,
}

// Platform display names
const platformNames: Record<string, string> = {
  amazon: 'Amazon',
  ebay: 'eBay',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  target: 'Target',
}

interface ComparisonPageProps {
  comparisonId: string
}

export function ComparisonPage({ comparisonId }: ComparisonPageProps) {
  const navigate = useNavigate()
  const params = useParams({ strict: false })

  const { data: comparison } = useSuspenseQuery(
    convexQuery(api.search.getComparison, {
      comparisonId: comparisonId as any,
    }),
  )

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <Trans id="comparison.notFound.title" />
            </h2>
            <p className="text-muted-foreground mb-6">
              <Trans id="comparison.notFound.description" />
            </p>
            <Button 
              onClick={() => navigate({ to: '/$lang', params: { lang: params.lang || 'en' } })}
              className="w-full"
            >
              <Trans id="comparison.newSearch" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { originalProduct, products } = comparison
  const allProducts = [originalProduct, ...products].filter(
    (p): p is NonNullable<typeof p> => p != null,
  )
  const hasAlternatives = products.length > 0

  // Sort by price (lowest first)
  const sortedProducts = allProducts.sort((a, b) => a.price - b.price)
  const lowestPrice = Math.min(...sortedProducts.map((p) => p.price))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/80 border-b border-border backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                <Trans id="comparison.title" />
              </h1>
              <p className="text-muted-foreground mt-1">
                {hasAlternatives ? (
                  <Trans
                    id="comparison.foundOptions"
                    values={{
                      count: sortedProducts.length,
                      productName: originalProduct?.name || 'this product',
                    }}
                  />
                ) : (
                  <Trans
                    id="comparison.noAlternatives"
                    values={{
                      productName: originalProduct?.name || 'this product',
                    }}
                  />
                )}
              </p>
            </div>
            <Button
              onClick={() =>
                navigate({
                  to: '/$lang',
                  params: { lang: params.lang || 'en' },
                })
              }
              className="shrink-0"
            >
              <Trans id="comparison.newSearch" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {sortedProducts.map((product) => {
            const isOriginal = product._id === originalProduct?._id
            const savings = product.price - lowestPrice
            const savingsPercent = ((savings / product.price) * 100).toFixed(1)
            const isLowestPrice = product.price === lowestPrice && !isOriginal

            // Get platform icon and name
            const platformKey = product.platform.toLowerCase()
            const PlatformIcon = platformIcons[platformKey] || ShoppingCart
            const platformName = platformNames[platformKey] || product.platform

            return (
              <Card
                key={product._id}
                className={`transition-all border ${
                  isLowestPrice
                    ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-border hover:shadow-md'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {isLowestPrice && (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 shrink-0">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            <Trans id="comparison.lowestPrice" />
                          </Badge>
                        )}
                        {isOriginal && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 shrink-0"
                          >
                            <Trans id="comparison.original" />
                          </Badge>
                        )}
                        <Badge className="bg-secondary/50 text-foreground border border-border/50 shrink-0">
                          <PlatformIcon
                            className="w-3 h-3 mr-1"
                            strokeWidth={2}
                          />
                          {platformName}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-3">
                        {product.name}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                            Price
                          </div>
                          <span className="font-bold text-lg text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {isLowestPrice && savings > 0 && (
                            <div className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              <Trans
                                id="comparison.savings"
                                values={{
                                  amount: savings.toFixed(2),
                                  percent: savingsPercent,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">
                            Stock
                          </div>
                          {product.availability ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <Trans id="comparison.inStock" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-rose-600">
                              <AlertCircle className="w-4 h-4" />
                              <Trans id="comparison.outOfStock" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* Additional product details can be added here when available in schema */}
                      </div>
                    </div>

                    <div className="ml-4 shrink-0">
                      <Button
                        asChild
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <Trans id="comparison.visitStore" />
                          <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        {hasAlternatives && (
          <Card className="mt-8 border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <TrendingDown
                  className="w-5 h-5 text-primary"
                  strokeWidth={1.5}
                />
                <Trans id="comparison.summary" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary border border-border">
                  <div className="text-3xl font-bold text-foreground">
                    {sortedProducts.length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <Trans id="comparison.productsFound" />
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-700">
                    ${lowestPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-emerald-600 mt-1">
                    <Trans id="comparison.lowestPrice" />
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-violet-50 border border-violet-200">
                  <div className="text-3xl font-bold text-violet-700">
                    ${((originalProduct?.price || 0) - lowestPrice).toFixed(2)}
                  </div>
                  <div className="text-sm text-violet-600 mt-1">
                    <Trans id="comparison.potentialSavings" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
