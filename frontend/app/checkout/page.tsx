'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCart } from '@/lib/context/CartContext'
import { supabase } from '@/lib/supabase/client'
import { getCustomerByUserId, createOrder, createOrderItem } from '@/lib/database/queries'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',
    billing_same_as_shipping: true,
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    billing_country: 'US',
    payment_method: 'card',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (formData.billing_same_as_shipping && customer) {
      setFormData(prev => ({
        ...prev,
        billing_address_line1: prev.shipping_address_line1 || customer.address_line1 || '',
        billing_address_line2: prev.shipping_address_line2 || customer.address_line2 || '',
        billing_city: prev.shipping_city || customer.city || '',
        billing_state: prev.shipping_state || customer.state || '',
        billing_zip: prev.shipping_zip || customer.zip_code || '',
        billing_country: prev.shipping_country || customer.country || 'US',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.billing_same_as_shipping, formData.shipping_address_line1, formData.shipping_city])

  const fetchCustomerData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/checkout')
        return
      }

      const customerData = await getCustomerByUserId(user.id)
      if (customerData) {
        setCustomer(customerData)
        setFormData(prev => ({
          ...prev,
          shipping_address_line1: customerData.address_line1 || '',
          shipping_address_line2: customerData.address_line2 || '',
          shipping_city: customerData.city || '',
          shipping_state: customerData.state || '',
          shipping_zip: customerData.zip_code || '',
          shipping_country: customerData.country || 'US',
        }))
      }
    } catch (error: any) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setProcessing(true)

    try {
      // Validate form
      if (!formData.shipping_address_line1 || !formData.shipping_city || !formData.shipping_state || !formData.shipping_zip) {
        setError('Please fill in all required shipping address fields')
        setProcessing(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get or create customer
      let customerData = customer
      if (!customerData) {
        // Create customer profile
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            address_line1: formData.shipping_address_line1,
            address_line2: formData.shipping_address_line2 || null,
            city: formData.shipping_city,
            state: formData.shipping_state,
            zip_code: formData.shipping_zip,
            country: formData.shipping_country,
          })
          .select()
          .single()
        customerData = newCustomer
      }

      if (!customerData) throw new Error('Failed to get customer data')

      // Calculate totals
      const subtotal = getTotal()
      const shippingCost = 10.00
      const totalAmount = subtotal + shippingCost

      // Format addresses
      const shippingAddress = `${formData.shipping_address_line1}${formData.shipping_address_line2 ? '\n' + formData.shipping_address_line2 : ''}\n${formData.shipping_city}, ${formData.shipping_state} ${formData.shipping_zip}\n${formData.shipping_country}`
      
      const billingAddress = formData.billing_same_as_shipping
        ? shippingAddress
        : `${formData.billing_address_line1}${formData.billing_address_line2 ? '\n' + formData.billing_address_line2 : ''}\n${formData.billing_city}, ${formData.billing_state} ${formData.billing_zip}\n${formData.billing_country}`

      // Create order
      const order = await createOrder({
        customer_id: customerData.id,
        vendor_id: null, // Will be set based on products
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        payment_status: 'pending',
        payment_method: formData.payment_method,
        payment_transaction_id: null,
        notes: null,
        status: 'pending',
      })

      // Create order items
      for (const item of items) {
        await createOrderItem({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })
      }

      // Redirect to payment page
      router.push(`/payment?order_id=${order.id}`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      setError(error.message || 'Failed to create order. Please try again.')
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Add items to your cart before checkout.</p>
            <Link href="/catalog">
              <Button>Browse Products</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
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

  const subtotal = getTotal()
  const shipping = 10.00
  const total = subtotal + shipping

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/cart" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Cart
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Address Line 1 *"
                  value={formData.shipping_address_line1}
                  onChange={(e) => setFormData({ ...formData, shipping_address_line1: e.target.value })}
                  required
                />
                <Input
                  label="Address Line 2"
                  value={formData.shipping_address_line2}
                  onChange={(e) => setFormData({ ...formData, shipping_address_line2: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    value={formData.shipping_city}
                    onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                    required
                  />
                  <Input
                    label="State *"
                    value={formData.shipping_state}
                    onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code *"
                    value={formData.shipping_zip}
                    onChange={(e) => setFormData({ ...formData, shipping_zip: e.target.value })}
                    required
                  />
                  <Input
                    label="Country *"
                    value={formData.shipping_country}
                    onChange={(e) => setFormData({ ...formData, shipping_country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Billing Address */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="billing_same"
                  checked={formData.billing_same_as_shipping}
                  onChange={(e) => setFormData({ ...formData, billing_same_as_shipping: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="billing_same" className="text-sm font-medium text-gray-700">
                  Billing address same as shipping
                </label>
              </div>

              {!formData.billing_same_as_shipping && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Billing Address</h2>
                  <Input
                    label="Address Line 1 *"
                    value={formData.billing_address_line1}
                    onChange={(e) => setFormData({ ...formData, billing_address_line1: e.target.value })}
                    required={!formData.billing_same_as_shipping}
                  />
                  <Input
                    label="Address Line 2"
                    value={formData.billing_address_line2}
                    onChange={(e) => setFormData({ ...formData, billing_address_line2: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City *"
                      value={formData.billing_city}
                      onChange={(e) => setFormData({ ...formData, billing_city: e.target.value })}
                      required={!formData.billing_same_as_shipping}
                    />
                    <Input
                      label="State *"
                      value={formData.billing_state}
                      onChange={(e) => setFormData({ ...formData, billing_state: e.target.value })}
                      required={!formData.billing_same_as_shipping}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP Code *"
                      value={formData.billing_zip}
                      onChange={(e) => setFormData({ ...formData, billing_zip: e.target.value })}
                      required={!formData.billing_same_as_shipping}
                    />
                    <Input
                      label="Country *"
                      value={formData.billing_country}
                      onChange={(e) => setFormData({ ...formData, billing_country: e.target.value })}
                      required={!formData.billing_same_as_shipping}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                isLoading={processing}
              >
                Proceed to Payment
              </Button>
              <Link href="/cart">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}

