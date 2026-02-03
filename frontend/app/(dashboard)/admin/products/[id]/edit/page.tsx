'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getProductById, updateProduct, getCategories } from '@/lib/database/queries'
import ImageUpload from '@/components/products/ImageUpload'
import type { Product, Category } from '@/types/database'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category_id: '',
    status: 'active' as 'active' | 'inactive' | 'out_of_stock',
    image_url: '',
  })

  useEffect(() => {
    fetchProduct()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await getProductById(productId)
      if (data) {
        setProduct(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          stock: data.stock.toString(),
          sku: data.sku || '',
          category_id: data.category_id || '',
          status: data.status,
          image_url: data.image_url || '',
        })
      } else {
        setError('Product not found')
      }
    } catch (error: any) {
      console.error('Error fetching product:', error)
      setError(error.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (!product) {
        setError('Product not found')
        setSaving(false)
        return
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        setError('Please fill in all required fields')
        setSaving(false)
        return
      }

      // Validate price and stock
      const price = parseFloat(formData.price)
      const stock = parseInt(formData.stock)

      if (isNaN(price) || price < 0) {
        setError('Price must be a valid positive number')
        setSaving(false)
        return
      }

      if (isNaN(stock) || stock < 0) {
        setError('Stock must be a valid positive number')
        setSaving(false)
        return
      }

      // Generate slug from name if name changed
      let slug = product.slug
      if (formData.name !== product.name) {
        slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      await updateProduct(productId, {
        name: formData.name,
        slug,
        description: formData.description || null,
        price: price,
        stock: stock,
        sku: formData.sku || null,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        status: formData.status,
      })

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      setError(error.message || 'Failed to update product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Button onClick={() => router.push('/admin/products')}>
            Back to Products
          </Button>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter product name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price ($) *"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />

              <Input
                label="Stock Quantity *"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU (Optional)"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Product SKU"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <ImageUpload
              onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
              currentImageUrl={formData.image_url}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={saving}>
                Update Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

