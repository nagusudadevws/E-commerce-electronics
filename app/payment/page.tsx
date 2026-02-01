'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { getOrderById, updateOrder } from '@/lib/database/queries'
import { useCart } from '@/lib/context/CartContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { OrderWithItems } from '@/types/database'

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const { clearCart } = useCart()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    } else {
      router.push('/checkout')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const orderData = await getOrderById(orderId)
      setOrder(orderData)
    } catch (error: any) {
      console.error('Error fetching order:', error)
      setError(error.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order || !orderId) return

    setProcessing(true)
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // Create payment intent
      const response = await fetch(`${apiUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(order.total_amount),
          currency: 'usd',
          order_id: orderId,
          customer_id: order.customer_id || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Payment failed' }))
        throw new Error(errorData.detail || 'Failed to create payment intent')
      }

      const { payment_intent_id, status } = await response.json()

      // For demo purposes, simulate payment success
      // In production, this would integrate with Stripe Elements
      if (status === 'requires_payment_method') {
        // Simulate successful payment for demo
        // In production, use Stripe Elements to collect payment
        
        // Update order with payment info
        await updateOrder(orderId, {
          payment_status: 'paid',
          payment_transaction_id: payment_intent_id,
          status: 'packed',
        })

        // Clear cart
        clearCart()

        // Redirect to success page
        router.push(`/payment/success?order_id=${orderId}`)
      } else {
        throw new Error('Payment intent creation failed')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment processing failed. Please try again.')
      setProcessing(false)
    }
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

  if (!order) {
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Link href="/checkout">
              <Button>Back to Checkout</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/checkout" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Checkout
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment</h1>

          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Demo Mode:</strong> This is a demonstration payment flow. 
                      In production, this would integrate with Stripe Elements to securely collect payment information.
                    </p>
                  </div>

                  <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    className="w-full"
                    size="lg"
                    isLoading={processing}
                  >
                    Complete Payment
                  </Button>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium text-gray-900">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${(Number(order.total_amount) - Number(order.shipping_cost)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${Number(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}

