'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCustomerById, getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Customer, Order } from '@/types/database'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const fetchCustomer = async () => {
    setLoading(true)
    try {
      const customerData = await getCustomerById(customerId)
      if (customerData) {
        setCustomer(customerData)

        // Get customer email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', customerData.user_id)
          .single()

        if (profile) {
          setCustomerEmail(profile.email)
        }

        // Get customer orders
        const customerOrders = await getOrders({ customerId: customerData.id })
        setOrders(customerOrders)
      }
    } catch (error: any) {
      console.error('Error fetching customer:', error)
      alert(error.message || 'Failed to load customer details')
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    )
  }

  if (!customer) {
    return (
      <AdminLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Customer not found</p>
          <Button onClick={() => router.push('/admin/customers')}>
            Back to Customers
          </Button>
        </Card>
      </AdminLayout>
    )
  }

  const totalSpent = orders
    .filter(order => order.status === 'delivered' && order.payment_status === 'paid')
    .reduce((sum, order) => sum + Number(order.total_amount), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-600 mt-1">View customer information and order history</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Customers
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900 mt-1">{customer.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {customer.address_line1 || 'N/A'}
                    {customer.address_line2 && (
                      <><br />{customer.address_line2}</>
                    )}
                    {customer.city && (
                      <><br />{customer.city}{customer.state && `, ${customer.state}`}</>
                    )}
                    {customer.zip_code && (
                      <><br />{customer.zip_code}</>
                    )}
                    {customer.country && (
                      <><br />{customer.country}</>
                    )}
                  </p>
                </div>
                {customer.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(customer.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order History */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
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
                      {orders.map((order) => (
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
                </div>
              )}
            </Card>
          </div>

          {/* Customer Summary */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Summary</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Orders</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Spent</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Average Order Value</label>
                  <p className="text-xl font-semibold text-gray-900 mt-1">
                    {orders.length > 0 
                      ? `$${(totalSpent / orders.length).toFixed(2)}` 
                      : '$0.00'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}




