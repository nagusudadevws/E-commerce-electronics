'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductById, getCategoryById } from '@/lib/database/queries'
import { useCart } from '@/lib/context/CartContext'
import type { Product } from '@/types/database'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [categoryName, setCategoryName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await getProductById(productId)
      if (data) {
        setProduct(data)
        if (data.category_id) {
          try {
            const category = await getCategoryById(data.category_id)
            setCategoryName(category?.name || '')
          } catch {
            // Category not found, ignore
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching product:', error)
      alert(error.message || 'Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity: quantity,
      imageUrl: product.image_url || undefined,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Catalog
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card className="p-0 overflow-hidden">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-400">
                <span className="text-lg">No Image Available</span>
              </div>
            )}
          </Card>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {categoryName && (
                <span className="text-sm text-blue-600 font-medium mb-2 block">
                  {categoryName}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-blue-600 mb-4">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 w-24">SKU:</span>
                <span className="text-sm text-gray-600">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 w-24">Stock:</span>
                <span className={`text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 w-24">Status:</span>
                <span className="text-sm text-gray-600 capitalize">{product.status}</span>
              </div>
            </div>

            {product.stock > 0 && product.status === 'active' ? (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    (Max: {product.stock})
                  </span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                >
                  {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
                </Button>
                {addedToCart && (
                  <div className="text-center">
                    <Link href="/cart">
                      <Button variant="outline" className="w-full mt-2">
                        View Cart
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Subtotal: <span className="font-semibold text-gray-900">
                      ${(Number(product.price) * quantity).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    This product is currently unavailable
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

