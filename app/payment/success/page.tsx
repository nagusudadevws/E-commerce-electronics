'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrderById } from '@/lib/database/queries'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { OrderWithItems } from '@/types/database'

function PaymentSuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const orderData = await getOrderById(orderId)
      setOrder(orderData)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            ElectroIoT
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {order && (
              <p className="text-sm text-gray-500 mt-2">
                Order Number: <span className="font-semibold">{order.order_number}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            {order && (
              <Link href={`/customer/orders/${order.id}`}>
                <Button className="w-full">View Order Details</Button>
              </Link>
            )}
            <Link href="/customer/orders">
              <Button variant="outline" className="w-full">View My Orders</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Electronics & IoT Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}

