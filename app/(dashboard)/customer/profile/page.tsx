'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { signOut } from '@/lib/auth/auth-utils'
import { supabase } from '@/lib/supabase/client'
import { getCustomerByUserId, createCustomer, updateCustomer } from '@/lib/database/queries'
import type { Customer } from '@/types/database'

export default function CustomerProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
  })

  useEffect(() => {
    fetchCustomerProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCustomerProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const customerData = await getCustomerByUserId(user.id)
      if (customerData) {
        setCustomer(customerData)
        setFormData({
          phone: customerData.phone || '',
          address_line1: customerData.address_line1 || '',
          address_line2: customerData.address_line2 || '',
          city: customerData.city || '',
          state: customerData.state || '',
          zip_code: customerData.zip_code || '',
          country: customerData.country || 'US',
        })
      }
    } catch (error: any) {
      console.error('Error fetching customer profile:', error)
      // If customer doesn't exist, that's okay - they can create one
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (customer) {
        // Update existing customer
        await updateCustomer(customer.id, formData)
      } else {
        // Create new customer profile
        await createCustomer({
          user_id: user.id,
          ...formData,
          date_of_birth: null, // Optional field
        })
      }

      alert('Profile updated successfully')
      fetchCustomerProfile()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(error.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/customer/orders')}
                >
                  My Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/catalog')}
                >
                  Browse Products
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />

                <Input
                  label="Address Line 1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="123 Main St"
                  required
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                  placeholder="Apt 4B"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                    required
                  />

                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="10001"
                    required
                  />

                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button type="submit" isLoading={saving}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/customer/orders')}
                  >
                    View Orders
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}

