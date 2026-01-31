'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createProduct, getCategories, getVendorByUserId } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Category } from '@/types/database'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category_id: '',
    status: 'active' as 'active' | 'inactive',
  })

  useEffect(() => {
    fetchCategories()
    fetchVendorId()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchVendorId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const vendor = await getVendorByUserId(user.id)
      if (vendor) {
        setVendorId(vendor.id)
      } else {
        // If user is admin, we might need to handle this differently
        // For now, we'll show an error if vendor not found
        const profile = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile.data?.role === 'admin') {
          // Admin can create products, but we need a vendor_id
          // For now, we'll require admin to select a vendor or create one
          setError('Admin users need to be associated with a vendor to create products. Please create a vendor profile first.')
        } else {
          setError('Vendor profile not found. Please create a vendor profile first.')
        }
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
      setError('Failed to load vendor information')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!vendorId) {
        setError('Vendor ID is required. Please ensure you have a vendor profile.')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Validate price and stock are positive numbers
      const price = parseFloat(formData.price)
      const stock = parseInt(formData.stock)

      if (isNaN(price) || price < 0) {
        setError('Price must be a valid positive number')
        setLoading(false)
        return
      }

      if (isNaN(stock) || stock < 0) {
        setError('Stock must be a valid positive number')
        setLoading(false)
        return
      }

      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      await createProduct({
        vendor_id: vendorId,
        category_id: formData.category_id || null,
        name: formData.name,
        slug,
        description: formData.description || null,
        price: price,
        stock: stock,
        sku: formData.sku || null,
        image_url: null,
        status: formData.status,
      })

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      setError(error.message || 'Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

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
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={loading} disabled={!vendorId}>
                Create Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
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

