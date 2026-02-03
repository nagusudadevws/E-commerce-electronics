'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { signOut } from '@/lib/auth/auth-utils'
import { supabase } from '@/lib/supabase/client'
import { getCustomerByUserId, getOrders } from '@/lib/database/queries'
import type { Order, Customer } from '@/types/database'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    recentOrdersCount: 0,
  })
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      // Get customer profile
      const customerData = await getCustomerByUserId(user.id)
      setCustomer(customerData)

      if (customerData) {
        // Get all orders for this customer
        const orders = await getOrders({ customerId: customerData.id })
        
        // Calculate stats
        const totalOrders = orders.length
        const totalSpent = orders
          .filter(o => o.status === 'delivered' && o.payment_status === 'paid')
          .reduce((sum, order) => sum + Number(order.total_amount), 0)
        const pendingOrders = orders.filter(o => o.status === 'pending').length
        
        // Get recent orders (last 5)
        const recent = orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setStats({
          totalOrders,
          totalSpent,
          pendingOrders,
          recentOrdersCount: recent.length,
        })
        setRecentOrders(recent)
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
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
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const isProfileComplete = customer && 
    customer.phone && 
    customer.address_line1 && 
    customer.city && 
    customer.state && 
    customer.zip_code

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
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
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
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
          <div className="space-y-6">
            {/* Welcome Header */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back{userEmail ? `, ${userEmail.split('@')[0]}` : ''}!
              </h2>
              <p className="text-gray-600">
                Manage your orders and profile from this dashboard.
              </p>
            </Card>

            {/* Profile Completion Alert */}
            {!isProfileComplete && (
              <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900">
                        Complete Your Profile
                      </h3>
                      <p className="text-yellow-700">
                        Add your shipping address and phone number to make checkout faster.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/customer/profile')}
                  >
                    Update Profile
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="text-4xl">🛒</div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${stats.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Status</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {isProfileComplete ? '✓' : '⚠'}
                    </p>
                  </div>
                  <div className="text-4xl">{isProfileComplete ? '✅' : '📝'}</div>
                </div>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link
                  href="/customer/orders"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All Orders →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet</p>
                  <Button onClick={() => router.push('/catalog')}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/customer/orders/${order.id}`}
                            className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-1 block"
                          >
                            Order #{order.order_number}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
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
                            {getStatusBadge(order.status)}
                          </div>
                          <Link
                            href={`/customer/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/catalog')}
                  className="w-full"
                >
                  🛍️ Browse Products
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/orders')}
                  className="w-full"
                >
                  📦 View All Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/profile')}
                  className="w-full"
                >
                  👤 Edit Profile
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}


