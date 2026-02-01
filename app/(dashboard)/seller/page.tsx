'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SellerDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  })
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchVendorInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (vendorId) {
      fetchDashboardStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])

  const fetchVendorInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get vendor info
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, business_name')
        .eq('user_id', user.id)
        .single()

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError)
        // If vendor doesn't exist, show message
        if (vendorError.code === 'PGRST116') {
          setLoading(false)
          return
        }
        throw vendorError
      }

      setVendorId(vendor.id)
      setVendorName(vendor.business_name)
    } catch (error) {
      console.error('Error fetching vendor info:', error)
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    if (!vendorId) return

    try {
      // Get total products for this vendor
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)

      // Get total orders for this vendor
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)

      // Get total revenue (sum of all delivered orders for this vendor)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', vendorId)
        .eq('status', 'delivered')
        .eq('payment_status', 'paid')

      const revenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      // Get low stock products for this vendor (stock < 10)
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .lt('stock', 10)
        .eq('status', 'active')

      // Get pending orders count for this vendor
      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('status', 'pending')

      setStats({
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue: revenue,
        lowStockCount: lowStockCount || 0,
        pendingOrders: pendingOrdersCount || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'My Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'blue',
    },
    {
      title: 'My Orders',
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
      <AdminLayout allowedRoles={['seller', 'admin']}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  if (!vendorId) {
    return (
      <AdminLayout allowedRoles={['seller', 'admin']}>
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Profile Required</h1>
          <p className="text-gray-600 mb-4">
            You need to set up your vendor profile before accessing the seller dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator to create your vendor profile.
          </p>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout allowedRoles={['seller', 'admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {vendorName}
          </h1>
          <p className="text-gray-600">
            Manage your products and orders from this dashboard.
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6 hover:shadow-md transition-shadow">
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

        {/* Alerts */}
        <div className="space-y-4">
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

          {stats.pendingOrders > 0 && (
            <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900">
                      Pending Orders
                    </h3>
                    <p className="text-yellow-700">
                      {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} pending processing
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/orders?status=pending')}
                >
                  View Orders
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/admin/products/new')}
              className="w-full"
            >
              ➕ Add New Product
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="w-full"
            >
              📦 View All Products
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="w-full"
            >
              🛒 View All Orders
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}


