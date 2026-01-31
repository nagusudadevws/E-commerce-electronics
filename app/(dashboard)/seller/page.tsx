'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'

export default function SellerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['seller', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Seller Dashboard</h1>
            <p className="text-gray-600">
              Welcome to the seller dashboard. This will be fully implemented in Phase 3.
            </p>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

