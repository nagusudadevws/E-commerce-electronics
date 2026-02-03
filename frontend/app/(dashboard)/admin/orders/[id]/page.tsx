'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getOrderById, updateOrder, getProductById } from '@/lib/database/queries'
import InvoiceDownload from '@/components/orders/InvoiceDownload'
import type { OrderWithItems, OrderStatus, OrderItem } from '@/types/database'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [orderItems, setOrderItems] = useState<(OrderItem & { productName?: string })[]>([])

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const data = await getOrderById(orderId)
      if (data) {
        setOrder(data)
        // Fetch product names for order items
        if (data.items) {
          const itemsWithProducts = await Promise.all(
            data.items.map(async (item) => {
              if (item.product_id) {
                try {
                  const product = await getProductById(item.product_id)
                  return {
                    ...item,
                    productName: product?.name || `Product #${item.product_id.slice(0, 8)}`,
                  }
                } catch {
                  return {
                    ...item,
                    productName: `Product #${item.product_id.slice(0, 8)}`,
                  }
                }
              }
              return {
                ...item,
                productName: 'Unknown Product',
              }
            })
          )
          setOrderItems(itemsWithProducts)
        } else {
          setOrderItems([])
        }
      }
    } catch (error: any) {
      console.error('Error fetching order:', error)
      alert(error.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return
    if (!confirm(`Change order status to ${newStatus}?`)) return

    setUpdating(true)
    try {
      await updateOrder(orderId, { status: newStatus })
      await fetchOrder()
    } catch (error: any) {
      console.error('Error updating order status:', error)
      alert(error.message || 'Failed to update order status')
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

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
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

  if (!order) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Button onClick={() => router.push('/admin/orders')}>
            Back to Orders
          </Button>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-blue-900">Update Order Status</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Current status: <span className="font-medium capitalize">{order.status}</span>
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

        {order.status === 'delivered' && (
          <Card className="p-4 bg-green-50 border-l-4 border-green-500">
            <p className="text-sm text-green-700 font-medium">
              ✓ This order has been delivered
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items found</p>
              ) : (
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
                      {orderItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            {item.product_id && (
                              <div className="text-xs text-gray-500">
                                ID: {item.product_id.slice(0, 8)}
                              </div>
                            )}
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
              )}
            </Card>

            {/* Shipping Information */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
              </div>
            </Card>

            {/* Billing Information */}
            {order.billing_address && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Information</h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 whitespace-pre-line">{order.billing_address}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">{order.payment_method || 'N/A'}</span>
                </div>
                {order.payment_transaction_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {order.payment_transaction_id.slice(0, 12)}...
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${(Number(order.total_amount) - Number(order.shipping_cost)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${Number(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>
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

            {/* Invoice Download */}
            {order.status === 'delivered' && order.payment_status === 'paid' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Invoice</h3>
                <InvoiceDownload order={order} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}


