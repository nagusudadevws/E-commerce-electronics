# Phase 4: Order Management System

---

## Overview

This phase implements the complete order lifecycle management system. Admins and sellers can view orders, update order statuses, track order history, and manage the entire order fulfillment process from pending to delivered.

**Duration Estimate**: 3-4 days  
**Dependencies**: Phase 3 (requires products and customer data from previous phases)

---

## Goals

1. Build order listing page with filtering and sorting
2. Implement order detail view with items
3. Create order status management (Pending → Packed → Shipped → Delivered)
4. Build order creation system (for testing/admin use)
5. Implement order history tracking
6. Create order search and filter functionality
7. Add order status update notifications (optional)

---

## Features & Components to Develop

### 1. Order Listing
- Orders table with all order details
- Order status badges
- Filter by status, date range, customer
- Search by order number
- Pagination
- Export orders (optional)

### 2. Order Detail View
- Complete order information
- Order items table
- Customer information
- Shipping and billing addresses
- Order status timeline
- Status update interface

### 3. Order Status Management
- Status update dropdown/buttons
- Status change confirmation
- Status history tracking
- Real-time status updates (optional)

### 4. Order Creation (Admin/Seller)
- Create order form
- Add products to order
- Calculate totals automatically
- Customer selection

### 5. Order Analytics
- Orders by status chart
- Revenue by period
- Order trends

---

## Technical Implementation Details

### Frontend Components

#### 1. Order Listing Page

**File: `app/(dashboard)/admin/orders/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/database'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filterStatus !== 'all') {
        filters.status = filterStatus
      }
      const data = await getOrders(filters)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage and track all orders</p>
          </div>
          <Button onClick={() => router.push('/admin/orders/new')}>
            + Create Order
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by order number..."
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
              <option value="pending">Pending</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Customer #{order.customer_id?.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(order.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-700 mr-4"
                        >
                          View
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

#### 2. Order Detail Page

**File: `app/(dashboard)/admin/orders/[id]/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getOrderById } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { OrderWithItems, OrderStatus } from '@/types/database'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await getOrderById(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return
    if (!confirm(`Change order status to ${newStatus}?`)) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrder()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'packed',
      packed: 'shipped',
      shipped: 'delivered',
      delivered: null,
      cancelled: null,
    }
    return statusFlow[currentStatus] || null
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Order not found</p>
        </Card>
      </AdminLayout>
    )
  }

  const nextStatus = getNextStatus(order.status)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.order_number}</h1>
            <p className="text-gray-600 mt-1">
              Created on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Orders
          </Button>
        </div>

        {/* Status Update */}
        {nextStatus && (
          <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Update Order Status</h3>
                <p className="text-sm text-blue-700">
                  Current status: <span className="font-medium">{order.status}</span>
                </p>
              </div>
              <Button
                onClick={() => handleStatusUpdate(nextStatus)}
                isLoading={updating}
              >
                Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            Product #{item.product_id?.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          ${Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          ${Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Shipping Information */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900 capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="font-medium text-gray-900 capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${(Number(order.total_amount) - Number(order.shipping_cost)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${Number(order.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
```

#### 3. Order Status Update Component

**File: `components/orders/OrderStatusUpdate.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { OrderStatus } from '@/types/database'

interface OrderStatusUpdateProps {
  currentStatus: OrderStatus
  onStatusUpdate: (status: OrderStatus) => Promise<void>
}

export default function OrderStatusUpdate({
  currentStatus,
  onStatusUpdate,
}: OrderStatusUpdateProps) {
  const [updating, setUpdating] = useState(false)

  const statusFlow: OrderStatus[] = ['pending', 'packed', 'shipped', 'delivered']
  const currentIndex = statusFlow.indexOf(currentStatus)
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null

  const handleUpdate = async () => {
    if (!nextStatus) return
    setUpdating(true)
    try {
      await onStatusUpdate(nextStatus)
    } finally {
      setUpdating(false)
    }
  }

  if (!nextStatus) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 font-medium">
          Order has been delivered
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-900">
            Current Status: <span className="capitalize">{currentStatus}</span>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Next step: Mark as {nextStatus}
          </p>
        </div>
        <Button
          onClick={handleUpdate}
          isLoading={updating}
          size="sm"
        >
          Update to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
        </Button>
      </div>
    </div>
  )
}
```

---

## Connection to Previous Phase

**Phase 3 → Phase 4**:
- Product management provides products for order items
- Dashboard metrics will include order statistics
- Admin interface patterns established for order management

---

## Connection to Next Phase

**Phase 4 → Phase 5**:
- Order system provides customer order history
- Orders need customer data for display
- Product catalog enables customers to create orders

---

## Testing Checklist

- [ ] Order listing page displays all orders
- [ ] Order detail page shows complete order information
- [ ] Status update works correctly
- [ ] Filter by status works
- [ ] Search by order number works
- [ ] Order items display correctly
- [ ] Order totals calculate correctly
- [ ] Status flow (pending → packed → shipped → delivered) works
- [ ] RLS policies prevent unauthorized access
- [ ] Responsive design works on mobile

---

## Deliverables Summary

1. ✅ Order listing page with filters
2. ✅ Order detail page
3. ✅ Order status management
4. ✅ Order search functionality
5. ✅ Order items display
6. ✅ Order summary component
7. ✅ Status update interface

---

**Previous Phase**: [Phase 3: Admin Dashboard & Product Management](./phase-3.md)  
**Next Phase**: [Phase 5: Customer Management & Product Catalog](./phase-5.md)


