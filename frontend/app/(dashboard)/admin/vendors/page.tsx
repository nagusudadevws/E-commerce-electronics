'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getVendors } from '@/lib/database/queries'
import { supabase } from '@/lib/supabase/client'
import type { Vendor } from '@/types/database'

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<(Vendor & { email?: string; full_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const vendorData = await getVendors()
      
      // Fetch user emails and names for each vendor
      const vendorsWithDetails = await Promise.all(
        vendorData.map(async (vendor) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', vendor.user_id)
            .single()
          
          return {
            ...vendor,
            email: profile?.email || 'N/A',
            full_name: profile?.full_name || 'N/A',
          }
        })
      )

      setVendors(vendorsWithDetails)
    } catch (error) {
      console.error('Error fetching vendors:', error)
      alert('Failed to fetch vendors. Please check your database connection.')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.business_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
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
            <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
            <p className="text-gray-600 mt-1">Manage vendor accounts</p>
          </div>
          <Button onClick={() => router.push('/admin/vendors/new')}>
            + Add New Vendor
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <Input
            placeholder="Search by business name, email, or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </Card>

        {/* Vendors Table */}
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'No vendors match your search' 
                  : 'No vendors found'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/admin/vendors/new')}>
                  Create First Vendor
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.business_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.full_name}</div>
                        <div className="text-sm text-gray-500">{vendor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.business_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.business_phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vendor.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
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



