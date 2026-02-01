'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth/auth-utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'admin' | 'seller' | 'customer',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      // Get vendor_id if seller
      let vendorId = null
      if (formData.role === 'seller') {
        // This will be handled in Phase 2 when vendors table is created
        // For now, we'll just create the user
      }

      const { user, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          role: formData.role,
          name: formData.name,
        }
      )

      if (authError) {
        // Provide more helpful error messages
        let errorMessage = authError.message || 'Failed to create account'
        
        if (errorMessage.includes('Supabase is not configured')) {
          errorMessage = 'Supabase is not configured. Please set up your .env.local file with Supabase credentials.'
        } else if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
          errorMessage = 'Unable to connect to Supabase. Please check your internet connection and ensure Supabase credentials are correct in .env.local'
        } else if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.'
        } else if (errorMessage.includes('Password') || errorMessage.includes('password')) {
          errorMessage = 'Password does not meet requirements. Please use a stronger password (at least 6 characters).'
        } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
          errorMessage = 'Email rate limit exceeded. This happens when too many signup attempts are made. Please wait 10-15 minutes before trying again, or disable email confirmation in Supabase Dashboard (Authentication → Settings → Email Auth → Disable "Confirm email").'
        } else if (errorMessage.includes('check your email')) {
          // Email confirmation required
          setError('')
          alert('Account created successfully! Please check your email to confirm your account before signing in.')
          router.push('/login')
          return
        }
        
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      if (!user) {
        setError('Account creation may require email confirmation. Please check your email.')
        setIsLoading(false)
        return
      }

      // Success - redirect to appropriate dashboard
      try {
        router.push(`/${formData.role}`)
      } catch (redirectError) {
        console.error('Redirect error:', redirectError)
        // Fallback: redirect to login
        router.push('/login')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-blue-600">ElectroIoT</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Get started with your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="John Doe"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="••••••••"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            placeholder="••••••••"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Account Type
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </p>
      </Card>
    </div>
  )
}

