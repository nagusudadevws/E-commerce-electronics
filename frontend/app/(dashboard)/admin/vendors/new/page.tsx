'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createVendor, getProfiles } from '@/lib/database/queries'
import type { Profile } from '@/types/database'

export default function NewVendorPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingSellers, setFetchingSellers] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    user_id: '',
    business_name: '',
    business_email: '',
    business_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    tax_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  })

  useEffect(() => {
    fetchSellers()
  }, [])

  const fetchSellers = async () => {
    setFetchingSellers(true)
    try {
      // Get all users with seller role who don't have a vendor profile yet
      const allSellers = await getProfiles({ role: 'seller' })
      
      // Filter out sellers who already have a vendor profile
      // We'll do this by checking if they have a vendor (this is a simplified check)
      setSellers(allSellers)
    } catch (error) {
      console.error('Error fetching sellers:', error)
      setError('Failed to load sellers. Please try again.')
    } finally {
      setFetchingSellers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.user_id || !formData.business_name || !formData.business_email) {
        setError('Please fill in all required fields (User, Business Name, Business Email)')
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.business_email)) {
        setError('Please enter a valid business email address')
        setLoading(false)
        return
      }

      await createVendor({
        user_id: formData.user_id,
        business_name: formData.business_name,
        business_email: formData.business_email,
        business_phone: formData.business_phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        country: formData.country,
        tax_id: formData.tax_id || null,
        status: formData.status,
      })

      router.push('/admin/vendors')
    } catch (error: any) {
      console.error('Error creating vendor:', error)
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        setError('This user already has a vendor profile. Please select a different user.')
      } else {
        setError(error.message || 'Failed to create vendor. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Vendor</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Seller User *
              </label>
              {fetchingSellers ? (
                <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                  Loading sellers...
                </div>
              ) : sellers.length === 0 ? (
                <div className="px-4 py-2.5 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-800">
                  No sellers found. Please create a seller account first.
                </div>
              ) : (
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a seller user</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.full_name || seller.email} ({seller.email})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the seller user account to associate with this vendor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name *"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                required
                placeholder="Acme Electronics"
              />

              <Input
                label="Business Email *"
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                required
                placeholder="business@example.com"
              />
            </div>

            <Input
              label="Business Phone"
              type="tel"
              value={formData.business_phone}
              onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />

              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
              />

              <Input
                label="ZIP Code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                placeholder="10001"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="US"
              />

              <Input
                label="Tax ID (Optional)"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                placeholder="EIN or Tax ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={loading} disabled={fetchingSellers || sellers.length === 0}>
                Create Vendor
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}



