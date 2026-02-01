'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth/auth-utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const { user, error: authError } = await signIn(email, password)

    if (authError || !user) {
      setError(authError?.message || 'Invalid credentials')
      setIsLoading(false)
      return
    }

    // Check if user is admin or seller
    const role = user.user_metadata?.role || 'customer'
    if (role !== 'admin' && role !== 'seller') {
      setError('Access denied. Admin or Seller account required.')
      setIsLoading(false)
      return
    }

    // Redirect to appropriate dashboard
    router.push(`/${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-blue-600">ElectroIoT</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to access admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Customer Login
            </Link>
          </p>
          <p className="text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}


