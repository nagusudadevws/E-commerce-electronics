# Phase 5: Customer Management & Product Catalog

---

## Overview

This phase builds the customer-facing product catalog and completes the admin customer management features. Customers can browse products, view details, and manage their profiles, while admins can view and manage all customer data.

**Duration Estimate**: 3-4 days  
**Dependencies**: Phase 4 (requires orders and products from previous phases)

---

## Goals

1. Build public-facing product catalog page
2. Implement category-based product browsing
3. Create product detail pages
4. Build customer registration and profile management
5. Create admin customer management dashboard
6. Implement customer-wise order history view
7. Add product search and filtering (optional enhancement)

---

## Features & Components to Develop

### 1. Product Catalog (Public)
- Product listing page with grid/list view
- Category navigation
- Product cards with images, price, stock status
- Product detail page
- Category filtering
- Search functionality (optional)

### 2. Customer Profile Management
- Customer registration flow
- Profile edit page
- Address management
- Order history view (customer's own orders)

### 3. Admin Customer Management
- Customer listing page
- Customer detail view
- Customer order history
- Customer search and filters

### 4. Layout Components
- Public layout (header, footer)
- Customer dashboard layout
- Navigation components

---

## Technical Implementation Details

### Frontend Components

#### 1. Public Product Catalog

**File: `app/catalog/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProducts, getCategories } from '@/lib/database/queries'
import type { Product, Category } from '@/types/database'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ categoryId: selectedCategory !== 'all' ? selectedCategory : undefined }),
        getCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No products found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/catalog/products/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg mb-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className={`text-sm ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

#### 2. Product Detail Page

**File: `app/catalog/products/[id]/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProductById } from '@/lib/database/queries'
import type { Product } from '@/types/database'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const data = await getProductById(productId)
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    // This will be implemented in Phase 6 with payment integration
    alert('Add to cart functionality will be available soon')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Product not found</p>
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Catalog
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card className="p-0 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-200 text-gray-400">
                No Image Available
              </div>
            )}
          </Card>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-blue-600 mb-4">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">SKU:</span>
                <span className="text-sm text-gray-600">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Stock:</span>
                <span className={`text-sm font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className="text-sm text-gray-600 capitalize">{product.status}</span>
              </div>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
```

#### 3. Customer Profile Page

**File: `app/(dashboard)/customer/profile/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { supabase } from '@/lib/supabase/client'
import type { Customer } from '@/types/database'

export default function CustomerProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
  })

  useEffect(() => {
    fetchCustomerProfile()
  }, [])

  const fetchCustomerProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (customerData) {
        setCustomer(customerData)
        setFormData({
          phone: customerData.phone || '',
          address_line1: customerData.address_line1 || '',
          address_line2: customerData.address_line2 || '',
          city: customerData.city || '',
          state: customerData.state || '',
          zip_code: customerData.zip_code || '',
          country: customerData.country || 'US',
        })
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (customer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', customer.id)

        if (error) throw error
      } else {
        // Create new customer profile
        const { error } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            ...formData,
          })

        if (error) throw error
      }

      alert('Profile updated successfully')
      fetchCustomerProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />

                <Input
                  label="Address Line 1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="123 Main St"
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  placeholder="Apt 4B"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />

                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="10001"
                  />

                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" isLoading={saving}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/customer/orders')}
                  >
                    View Orders
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
```

#### 4. Customer Order History

**File: `app/(dashboard)/customer/orders/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import { getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Order } from '@/types/database'

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerOrders()
  }, [])

  const fetchCustomerOrders = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (customer) {
        setCustomerId(customer.id)
        const ordersData = await getOrders({ customerId: customer.id })
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <Link href="/catalog" className="text-blue-600 hover:text-blue-700 font-medium">
                Browse Products
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 mb-2">
                        ${Number(order.total_amount).toFixed(2)}
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
```

#### 5. Admin Customer Management

**File: `app/(dashboard)/admin/customers/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getCustomers, getOrders } from '@/lib/database/queries'
import type { Customer, Order } from '@/types/database'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    // You can add more search fields here
    return true // Placeholder
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts</p>
        </div>

        <Card className="p-4">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </Card>

        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{customer.city || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View Details
                        </Link>
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

---

## Connection to Previous Phase

**Phase 4 → Phase 5**:
- Order system provides customer order history data
- Orders reference customers for display
- Product data is needed for catalog display

---

## Connection to Next Phase

**Phase 5 → Phase 6**:
- Product catalog needs image uploads for better UX
- Orders need payment processing
- Complete order flow enables payment integration

---

## Testing Checklist

- [ ] Product catalog displays all active products
- [ ] Category filtering works correctly
- [ ] Product detail page shows complete information
- [ ] Customer can view and edit profile
- [ ] Customer can view order history
- [ ] Admin can view all customers
- [ ] Admin can view customer order history
- [ ] Search functionality works (if implemented)
- [ ] Responsive design works on mobile
- [ ] Protected routes work correctly

---

## Deliverables Summary

1. ✅ Public product catalog page
2. ✅ Product detail pages
3. ✅ Category-based browsing
4. ✅ Customer profile management
5. ✅ Customer order history
6. ✅ Admin customer management
7. ✅ Customer registration flow

---

**Previous Phase**: [Phase 4: Order Management System](./phase-4.md)  
**Next Phase**: [Phase 6: Payment Gateway Integration & Media Upload](./phase-6.md)





