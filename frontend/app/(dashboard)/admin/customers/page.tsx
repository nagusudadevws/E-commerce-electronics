'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCustomers, getOrders } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Customer, Order } from '@/types/database'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<(Customer & { email?: string; orderCount?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const customerData = await getCustomers()
      
      // Fetch user emails and order counts for each customer
      const customersWithDetails = await Promise.all(
        customerData.map(async (customer) => {
          // Get user email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', customer.user_id)
            .single()

          // Get order count
          const orders = await getOrders({ customerId: customer.id })
          
          return {
            ...customer,
            email: profile?.email || 'N/A',
            orderCount: orders.length,
          }
        })
      )

      setCustomers(customersWithDetails)
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Failed to fetch customers. Please check your database connection.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts</p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <Input
            placeholder="Search by email, phone, or customer ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </Card>

        {/* Customers Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'No customers match your search' 
                  : 'No customers found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {customer.city && customer.state 
                            ? `${customer.city}, ${customer.state}` 
                            : customer.country || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.orderCount || 0}
                        </div>
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
