'use client'

import AdminLayout from '@/components/layout/AdminLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts</p>
          </div>
        </div>

        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Customer management will be implemented in Phase 4</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    </AdminLayout>
  )
}

