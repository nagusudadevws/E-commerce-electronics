# Phase 3: Admin Dashboard & Product Management

---

## Overview

This phase builds the core admin interface with a comprehensive dashboard and full product management capabilities. Admins and sellers will be able to view metrics, manage products, handle categories, and monitor inventory through an intuitive, modern interface.

**Duration Estimate**: 3-4 days  
**Dependencies**: Phase 2 (requires database schema, products, and categories tables)

---

## Goals

1. Build admin dashboard with key metrics and visualizations
2. Implement complete product CRUD operations
3. Create category management interface
4. Build product listing with pagination and filtering
5. Implement stock management and alerts
6. Create product status management (Active/Inactive)
7. Design responsive admin layout with navigation

---

## Features & Components to Develop

### 1. Admin Dashboard
- Dashboard overview page
- Key metrics cards (Total Products, Total Orders, Revenue, Low Stock Alerts)
- Recent orders widget
- Low stock products widget
- Revenue chart (optional)

### 2. Product Management
- Product listing page with table view
- Add product form
- Edit product form
- Delete product confirmation
- Product detail view
- Bulk actions (optional)

### 3. Category Management
- Category listing
- Add/edit category form
- Category hierarchy display (if parent categories exist)

### 4. Layout Components
- Admin sidebar navigation
- Admin header with user menu
- Breadcrumb navigation
- Page layout wrapper

### 5. Data Display Components
- Data table component
- Pagination component
- Filter/search component
- Status badges
- Empty states

---

## Technical Implementation Details

### Frontend Components

#### 1. Admin Layout

**File: `components/layout/AdminLayout.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth/auth-utils'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Button from '@/components/ui/Button'

interface AdminLayoutProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'seller')[]
}

export default function AdminLayout({ children, allowedRoles = ['admin', 'seller'] }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    { name: 'Customers', href: '/admin/customers', icon: '👥' },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">E-Commerce Admin</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => pathname === item.href || pathname?.startsWith(item.href + '/'))?.name || 'Dashboard'}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

#### 2. Dashboard Page

**File: `app/(dashboard)/admin/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase/client'
import type { Product, Order } from '@/types/database'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Get total revenue (sum of all delivered orders)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .eq('payment_status', 'paid')

      const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      // Get low stock products (stock < 10)
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10)
        .eq('status', 'active')

      setStats({
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue: revenue,
        lowStockCount: lowStockCount || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '🛒',
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'purple',
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockCount,
      icon: '⚠️',
      color: 'red',
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockCount > 0 && (
          <Card className="p-6 border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Low Stock Alert
                </h3>
                <p className="text-red-700">
                  {stats.lowStockCount} product{stats.lowStockCount !== 1 ? 's' : ''} have low stock (less than 10 units)
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
```

#### 3. Product Listing Page

**File: `app/(dashboard)/admin/products/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getProducts, deleteProduct } from '@/lib/database/queries'
import type { Product } from '@/types/database'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchProducts()
  }, [filterStatus])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filterStatus !== 'all') {
        filters.status = filterStatus
      }
      const data = await getProducts(filters)
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(id)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <Button onClick={() => router.push('/admin/products/new')}>
            + Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
```

#### 4. Add/Edit Product Form

**File: `app/(dashboard)/admin/products/new/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createProduct } from '@/lib/database/queries'
import { getCategories } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Category } from '@/types/database'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
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
    // Get current user's vendor ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Store vendor_id for later use
    if (vendor) {
      // You can store this in state or context
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get vendor_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!vendor) throw new Error('Vendor profile not found')

      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      await createProduct({
        vendor_id: vendor.id,
        category_id: formData.category_id || null,
        name: formData.name,
        slug,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        image_url: null,
        status: formData.status,
      })

      router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <Card className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Product Name"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              placeholder="0.00"
            />

            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={loading}>
              Create Product
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </AdminLayout>
  )
}
```

---

## Connection to Previous Phase

**Phase 2 → Phase 3**:
- Database schema provides product and category models
- RLS policies ensure secure data access
- TypeScript types enable type-safe component development
- Query utilities support data fetching

---

## Connection to Next Phase

**Phase 3 → Phase 4**:
- Product management creates inventory for orders
- Dashboard metrics will include order data
- Product data is needed for order items

---

## Testing Checklist

- [ ] Dashboard displays correct metrics
- [ ] Product listing page loads and displays products
- [ ] Add product form creates new products
- [ ] Edit product form updates existing products
- [ ] Delete product removes products correctly
- [ ] Filter and search work correctly
- [ ] Low stock alerts display when stock < 10
- [ ] Status badges display correctly
- [ ] Navigation works between pages
- [ ] Responsive design works on mobile

---

## Deliverables Summary

1. ✅ Admin dashboard with metrics
2. ✅ Product listing page
3. ✅ Add/Edit product forms
4. ✅ Delete product functionality
5. ✅ Category management (basic)
6. ✅ Filter and search functionality
7. ✅ Admin layout with navigation
8. ✅ Status management
9. ✅ Stock management

---

**Previous Phase**: [Phase 2: Database Schema & Core Models](./phase-2.md)  
**Next Phase**: [Phase 4: Order Management System](./phase-4.md)



