'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { signOut } from '@/lib/auth/auth-utils'
import { getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import { getCustomerByUserId } from '@/lib/database/queries'
import type { Order } from '@/types/database'

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCustomerOrders = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const customer = await getCustomerByUserId(user.id)
      if (customer) {
        setCustomerId(customer.id)
        const ordersData = await getOrders({ customerId: customer.id })
        setOrders(ordersData)
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      alert(error.message || 'Failed to load orders')
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
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
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
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <div className="flex gap-4">
                <Link
                  href="/customer/profile"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/catalog"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Browse Products
                </Link>
                <Button
                  variant="outline"
                  size="sm"
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4 text-lg">You haven&apos;t placed any orders yet</p>
              <Link 
                href="/catalog" 
                className="text-blue-600 hover:text-blue-700 font-medium inline-block"
              >
                Browse Products →
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-1 block"
                      >
                        Order #{order.order_number}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                        <div className="flex gap-2 justify-end">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                      </div>
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                      >
                        View Details →
                      </Link>
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

