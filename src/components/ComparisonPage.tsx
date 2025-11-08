import { useNavigate, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Trans } from '@lingui/react'

import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <Trans id="comparison.notFound.title" />
          </h2>
          <p className="text-gray-600">
            <Trans id="comparison.notFound.description" />
          </p>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <Trans id="comparison.title" />
              </h1>
              <p className="text-gray-600 mt-1">
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

            return (
              <Card
                key={product._id}
                className={`${
                  product.price === lowestPrice && !isOriginal
                    ? 'border-green-500'
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {product.price === lowestPrice && !isOriginal && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Trans id="comparison.lowestPrice" />
                          </Badge>
                        )}
                        {isOriginal && (
                          <Badge variant="secondary">
                            <Trans id="comparison.original" />
                          </Badge>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.price === lowestPrice &&
                            !isOriginal &&
                            savings > 0 && (
                              <div className="text-green-600 text-xs mt-1">
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
                          {product.availability ? (
                            <span className="text-green-600">
                              <Trans id="comparison.inStock" />
                            </span>
                          ) : (
                            <span className="text-red-600">
                              <Trans id="comparison.outOfStock" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {/* Additional product details can be added here when available in schema */}
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button asChild>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Trans id="comparison.visitStore" />
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
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
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Trans id="comparison.summary" />
              </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sortedProducts.length}
                </div>
                <div className="text-sm text-gray-600">
                  <Trans id="comparison.productsFound" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${lowestPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  <Trans id="comparison.lowestPrice" />
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: 'color(display-p3 0.14902 0.14902 0.14902)' }}
                >
                  ${((originalProduct?.price || 0) - lowestPrice).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
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
