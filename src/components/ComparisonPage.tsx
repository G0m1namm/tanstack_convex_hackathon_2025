import { useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Trans } from '@lingui/react'

import { api } from '../../convex/_generated/api'

interface ComparisonPageProps {
  comparisonId: string
}

export function ComparisonPage({ comparisonId }: ComparisonPageProps) {
  const navigate = useNavigate()

  const { data: comparison } = useSuspenseQuery(
    convexQuery(api.search.getComparison, { comparisonId: comparisonId as any })
  )

  if (!comparison) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('comparison.notFound.title')}</h2>
          <p className="text-gray-600">{t('comparison.notFound.description')}</p>
        </div>
      </div>
    )
  }

  const { originalProduct, products } = comparison
  const allProducts = [originalProduct, ...products].filter((p): p is NonNullable<typeof p> => p != null)
  const hasAlternatives = products.length > 0

  // Sort by price (lowest first)
  const sortedProducts = allProducts.sort((a, b) => a.price - b.price)
  const lowestPrice = Math.min(...sortedProducts.map(p => p.price))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('comparison.title')}</h1>
              <p className="text-gray-600 mt-1">
                {hasAlternatives
                  ? t('comparison.foundOptions', { count: sortedProducts.length, productName: originalProduct?.name || 'this product' })
                  : t('comparison.noAlternatives', { productName: originalProduct?.name || 'this product' })
                }
              </p>
            </div>
            <button
              onClick={() => navigate({ to: '/$lang' })}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              {t('comparison.newSearch')}
            </button>
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
              <div
                key={product._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                  product.price === lowestPrice && !isOriginal ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {product.price === lowestPrice && !isOriginal && (
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                            {t('comparison.lowestPrice')}
                          </span>
                        )}
                        {isOriginal && (
                          <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2 py-1 rounded">
                            {t('comparison.original')}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                          {product.price === lowestPrice && !isOriginal && savings > 0 && (
                            <div className="text-green-600 text-xs mt-1">
                              {t('comparison.savings', { amount: savings.toFixed(2), percent: savingsPercent })}
                            </div>
                          )}
                        </div>
                        {product.rating && (
                          <div>{t('comparison.rating', { rating: product.rating })}</div>
                        )}
                        {product.reviews && (
                          <div>{t('comparison.reviews', { count: product.reviews })}</div>
                        )}
                        <div>
                          {product.inStock ? (
                            <span className="text-green-600">{t('comparison.inStock')}</span>
                          ) : (
                            <span className="text-red-600">{t('comparison.outOfStock')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {product.freeShipping && (
                          <span className="text-green-600">{t('comparison.freeShipping')}</span>
                        )}
                        {product.shipping && !product.freeShipping && (
                          <span>{t('comparison.shipping', { amount: product.shipping.toFixed(2) })}</span>
                        )}
                        {product.condition && (
                          <span>{t('comparison.condition', { condition: product.condition })}</span>
                        )}
                        {product.seller && (
                          <span>{t('comparison.seller', { seller: product.seller })}</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
                      >
                        {t('comparison.visitStore')}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        {hasAlternatives && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('comparison.summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{sortedProducts.length}</div>
                <div className="text-sm text-gray-600">{t('comparison.productsFound')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${lowestPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-600">{t('comparison.lowestPriceLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  ${((originalProduct?.price || 0) - lowestPrice).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">{t('comparison.potentialSavings')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
