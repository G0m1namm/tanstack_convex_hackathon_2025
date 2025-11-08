import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/compare/$comparisonId')({
  loader: ({ params }) => ({
    comparisonId: params.comparisonId,
  }),
  component: ComparisonPage,
})

function ComparisonPage() {
  const { comparisonId } = Route.useLoaderData()

  const { data: comparison } = useSuspenseQuery(
    convexQuery(api.search.getComparison, { comparisonId: comparisonId as any })
  )

  if (!comparison) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparison Not Found</h2>
          <p className="text-gray-600">The comparison you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const { originalProduct, products } = comparison
  const allProducts = [originalProduct, ...products].filter(Boolean)

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
              <h1 className="text-2xl font-bold text-gray-900">Price Comparison</h1>
              <p className="text-gray-600 mt-1">
                Found {sortedProducts.length} options for "{originalProduct.name}"
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              New Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {sortedProducts.map((product, index) => {
            const isOriginal = product._id === originalProduct._id
            const savings = product.price - lowestPrice
            const savingsPercent = ((savings / product.price) * 100).toFixed(1)

            return (
              <div
                key={product._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                  product.price === lowestPrice
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {product.price === lowestPrice && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            🏆 Lowest Price
                          </span>
                        )}
                        {isOriginal && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            Original
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          product.platform === 'amazon' ? 'bg-orange-100 text-orange-800' :
                          product.platform === 'ebay' ? 'bg-blue-100 text-blue-800' :
                          product.platform === 'walmart' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.platform}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {product.brand && <span>Brand: {product.brand}</span>}
                        {product.availability ? (
                          <span className="text-green-600">✅ In Stock</span>
                        ) : (
                          <span className="text-red-600">❌ Out of Stock</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </div>
                      )}
                      {savings > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Save ${savings.toFixed(2)} ({savingsPercent}%)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(product.extractedAt).toLocaleDateString()}
                    </div>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      Visit Store →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sortedProducts.length}</div>
              <div className="text-sm text-gray-600">Products Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${lowestPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Lowest Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${(sortedProducts[0]?.price - lowestPrice).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Potential Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
