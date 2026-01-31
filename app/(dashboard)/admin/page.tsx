'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome to the admin dashboard. This will be fully implemented in Phase 3.
            </p>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

