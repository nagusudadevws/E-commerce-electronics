'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { signOut } from '@/lib/auth/auth-utils'
import { getOrderById, getProductById } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import { getCustomerByUserId } from '@/lib/database/queries'
import InvoiceDownload from '@/components/orders/InvoiceDownload'
import type { OrderWithItems, OrderItem } from '@/types/database'

export default function CustomerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [orderItems, setOrderItems] = useState<(OrderItem & { productName?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const customer = await getCustomerByUserId(user.id)
      if (!customer) {
        router.push('/customer/profile')
        return
      }

      const orderData = await getOrderById(orderId)
      if (!orderData) {
        alert('Order not found')
        router.push('/customer/orders')
        return
      }

      // Verify order belongs to this customer
      if (orderData.customer_id !== customer.id) {
        alert('You do not have permission to view this order')
        router.push('/customer/orders')
        return
      }

      setIsOwner(true)
      setOrder(orderData)

      // Fetch product names for order items
      if (orderData.items) {
        const itemsWithProducts = await Promise.all(
          orderData.items.map(async (item) => {
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
    } catch (error: any) {
      console.error('Error fetching order:', error)
      alert(error.message || 'Failed to load order details')
      router.push('/customer/orders')
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
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
      <ProtectedRoute allowedRoles={['customer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!order || !isOwner) {
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <p className="text-gray-500 mb-4">Order not found or access denied</p>
            <Button onClick={() => router.push('/customer/orders')}>
              Back to Orders
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.push('/customer/orders')}>
                  Back to Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut()
                    router.push('/')
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                  SKU: {item.product_id.slice(0, 8)}
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
                  <div className="flex justify-between items-center text-sm">
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

              <Card className="bg-blue-50 border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  If you have questions about this order, please contact our support team.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

