'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getVendorById, getProducts, getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Vendor, Product, Order } from '@/types/database'

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [vendorEmail, setVendorEmail] = useState<string>('')
  const [vendorName, setVendorName] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId])

  const fetchVendor = async () => {
    setLoading(true)
    try {
      const vendorData = await getVendorById(vendorId)
      if (vendorData) {
        setVendor(vendorData)

        // Get vendor user email and name
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', vendorData.user_id)
          .single()

        if (profile) {
          setVendorEmail(profile.email)
          setVendorName(profile.full_name || '')
        }

        // Get vendor products
        const vendorProducts = await getProducts({ vendorId: vendorData.id })
        setProducts(vendorProducts)

        // Get vendor orders
        const vendorOrders = await getOrders({ vendorId: vendorData.id })
        setOrders(vendorOrders)
      }
    } catch (error: any) {
      console.error('Error fetching vendor:', error)
      alert(error.message || 'Failed to load vendor details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const getProductStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      out_of_stock: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.toUpperCase().replace('_', ' ')}
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

  if (!vendor) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Vendor not found</p>
          <Button onClick={() => router.push('/admin/vendors')}>
            Back to Vendors
          </Button>
        </Card>
      </AdminLayout>
    )
  }

  const totalRevenue = orders
    .filter(order => order.status === 'delivered' && order.payment_status === 'paid')
    .reduce((sum, order) => sum + Number(order.total_amount), 0)

  const activeProducts = products.filter(p => p.status === 'active').length
  const lowStockProducts = products.filter(p => p.stock < 10 && p.status === 'active').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.business_name}</h1>
            <p className="text-gray-600 mt-1">Vendor details and statistics</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Vendors
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-sm text-gray-900 mt-1">{vendor.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Associated User</label>
                  <p className="text-sm text-gray-900 mt-1">{vendorName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{vendorEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Email</label>
                  <p className="text-sm text-gray-900 mt-1">{vendor.business_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Phone</label>
                  <p className="text-sm text-gray-900 mt-1">{vendor.business_phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {vendor.address || 'N/A'}
                    {vendor.city && (
                      <><br />{vendor.city}{vendor.state && `, ${vendor.state}`}</>
                    )}
                    {vendor.zip_code && (
                      <><br />{vendor.zip_code}</>
                    )}
                    {vendor.country && (
                      <><br />{vendor.country}</>
                    )}
                  </p>
                </div>
                {vendor.tax_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tax ID</label>
                    <p className="text-sm text-gray-900 mt-1">{vendor.tax_id}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(vendor.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Products */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Products</h2>
                <Link
                  href="/admin/products"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All Products →
                </Link>
              </div>
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No products found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.slice(0, 10).map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {product.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${Number(product.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {product.stock}
                            {product.stock < 10 && (
                              <span className="ml-2 text-xs text-red-600">⚠ Low Stock</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {getProductStatusBadge(product.status)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length > 10 && (
                    <div className="mt-4 text-center">
                      <Link
                        href={`/admin/products?vendor=${vendorId}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View all {products.length} products →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Orders */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All Orders →
                </Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Order Number
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ${Number(order.total_amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length > 10 && (
                    <div className="mt-4 text-center">
                      <Link
                        href={`/admin/orders?vendor=${vendorId}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View all {orders.length} orders →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Vendor Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Summary</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Products</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{activeProducts} active</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Orders</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                {lowStockProducts > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <label className="text-sm font-medium text-yellow-800">Low Stock Alert</label>
                    <p className="text-lg font-bold text-yellow-900 mt-1">
                      {lowStockProducts} product{lowStockProducts !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">with stock &lt; 10</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}



