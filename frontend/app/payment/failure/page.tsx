'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

function PaymentFailurePageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Payment could not be processed'

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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-2">
              {error}
            </p>
            <p className="text-sm text-gray-500">
              Please try again or contact support if the problem persists.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()} 
              className="w-full"
            >
              Try Again
            </Button>
            <Link href="/cart">
              <Button variant="outline" className="w-full">Back to Cart</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full text-sm">Contact Support</Button>
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

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentFailurePageContent />
    </Suspense>
  )
}

