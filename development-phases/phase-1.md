# Phase 1: Project Setup & Authentication Foundation

---

## Overview

This phase establishes the foundational infrastructure for the entire e-commerce platform. We'll set up the Next.js project, configure Supabase, implement authentication with role-based access control, and establish the UI design system that will be used throughout all subsequent phases.

**Duration Estimate**: 2-3 days  
**Dependencies**: Phase 0 (landing page provides navigation to auth pages)

---

## Goals

1. Initialize Next.js project with TypeScript and essential dependencies
2. Set up Supabase project and configure authentication
3. Implement secure authentication flow (login, signup, logout)
4. Create role-based access control system (Admin, Seller, Customer)
5. Build protected route middleware
6. Establish UI design system and reusable components
7. Create authentication UI pages with institute-style design

---

## Features & Components to Develop

### 1. Project Initialization
- Next.js 14+ project with TypeScript
- Tailwind CSS configuration
- ESLint and Prettier setup
- Environment variable configuration
- Project folder structure

### 2. Supabase Integration
- Supabase client setup
- Environment variables configuration
- Supabase Auth configuration
- Database connection setup

### 3. Authentication System
- User registration (signup)
- User login
- User logout
- Password reset functionality
- Session management
- JWT token handling

### 4. Role-Based Access Control (RBAC)
- User role assignment (Admin, Seller, Customer)
- Role verification utilities
- Protected route components
- Role-based navigation guards

### 5. UI Components (Design System Foundation)
- Button component (primary, secondary, outline variants)
- Input component (text, email, password)
- Card component
- Layout components (Header, Sidebar, Footer)
- Loading states and skeletons
- Error message components

### 6. Authentication Pages
- Login page
- Signup page
- Forgot password page
- Protected dashboard placeholder

---

## Technical Implementation Details

### Frontend Setup

#### 1. Next.js Project Initialization

```bash
npx create-next-app@latest e-commerce-platform --typescript --tailwind --app --no-src-dir
cd e-commerce-platform
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zod react-hook-form @hookform/resolvers
npm install zustand  # Optional: for state management
```

#### 2. Project Structure

```
e-commerce-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── seller/
│   │   │   └── page.tsx
│   │   └── customer/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── auth/
│   │   ├── auth-utils.ts
│   │   └── role-utils.ts
│   └── utils.ts
├── types/
│   └── auth.ts
├── .env.local
└── tailwind.config.ts
```

#### 3. Supabase Client Setup

**File: `lib/supabase/client.ts`**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  return createClientComponentClient()
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**File: `lib/supabase/server.ts`**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}
```

#### 4. Authentication Utilities

**File: `lib/auth/auth-utils.ts`**
```typescript
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: Error | null
}

export const signUp = async (
  email: string,
  password: string,
  metadata?: { role?: string; name?: string }
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { user: data.user, error: error as Error | null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error: error as Error | null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}

export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error as Error | null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    return { error: error as Error | null }
  } catch (error) {
    return { error: error as Error }
  }
}
```

#### 5. Role-Based Access Control

**File: `lib/auth/role-utils.ts`**
```typescript
import { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'seller' | 'customer'

export const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null
  return (user.user_metadata?.role as UserRole) || 'customer'
}

export const isAdmin = (user: User | null): boolean => {
  return getUserRole(user) === 'admin'
}

export const isSeller = (user: User | null): boolean => {
  return getUserRole(user) === 'seller'
}

export const isCustomer = (user: User | null): boolean => {
  return getUserRole(user) === 'customer'
}

export const hasRole = (user: User | null, role: UserRole): boolean => {
  return getUserRole(user) === role
}
```

#### 6. Protected Route Component

**File: `components/auth/ProtectedRoute.tsx`**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/lib/auth/role-utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push(redirectTo)
        return
      }

      setUser(session.user)
      
      if (allowedRoles) {
        const userRole = session.user.user_metadata?.role as UserRole
        if (!allowedRoles.includes(userRole)) {
          router.push('/unauthorized')
          return
        }
      }
      
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push(redirectTo)
        } else {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
}
```

### UI Components (Design System)

#### 1. Button Component

**File: `components/ui/Button.tsx`**
```typescript
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
```

#### 2. Input Component

**File: `components/ui/Input.tsx`**
```typescript
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
```

#### 3. Card Component

**File: `components/ui/Card.tsx`**
```typescript
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
```

#### 4. Loading Spinner

**File: `components/ui/LoadingSpinner.tsx`**
```typescript
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizes[size],
        className
      )}
    />
  )
}
```

#### 5. Utility Function

**File: `lib/utils.ts`**
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Authentication Pages

#### 1. Login Page

**File: `app/(auth)/login/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth/auth-utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
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

    // Redirect based on role
    const role = user.user_metadata?.role || 'customer'
    router.push(`/${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-blue-600">ElectroIoT</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
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
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up
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
```

#### 2. Signup Page

**File: `app/(auth)/signup/page.tsx`**
```typescript
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

    const { user, error: authError } = await signUp(
      formData.email,
      formData.password,
      {
        role: formData.role,
        name: formData.name,
      }
    )

    if (authError || !user) {
      setError(authError?.message || 'Failed to create account')
      setIsLoading(false)
      return
    }

    router.push(`/${formData.role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
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
```

#### 3. Admin Login Page

**File: `app/(auth)/admin/login/page.tsx`**

```typescript
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

    // Check if user is admin
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
```

### Supabase Configuration

#### 1. Environment Variables

**File: `.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 2. Supabase Dashboard Setup

1. Create a new Supabase project
2. Enable Email authentication in Authentication settings
3. Configure email templates (optional)
4. Set up redirect URLs for password reset

---

## Connection to Previous Phase

**Phase 0 → Phase 1**:
- Landing page header provides "Sign In", "Get Started", and "Admin Login" links
- All authentication pages (login, signup, admin login) should link back to landing page
- Authentication pages include "Back to Home" links for better navigation
- Brand logo/name should be consistent between landing page and auth pages

## Connection to Next Phase

**Phase 1 → Phase 2**: 
- Authentication system provides user context and roles
- User roles will be used to create RLS policies in the database
- Supabase client setup enables database operations
- TypeScript types foundation supports database schema types

---

## Testing Checklist

- [ ] User can sign up with email and password
- [ ] User can log in with correct credentials
- [ ] User cannot log in with incorrect credentials
- [ ] User can log out successfully
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based access control works (admin/seller/customer)
- [ ] Password reset flow works (if implemented)
- [ ] UI components render correctly with proper styling
- [ ] Loading states display during async operations
- [ ] Error messages display appropriately

---

## Deliverables Summary

1. ✅ Next.js project initialized with TypeScript
2. ✅ Supabase configured and connected
3. ✅ Authentication system (signup, login, logout)
4. ✅ Role-based access control utilities
5. ✅ Protected route component
6. ✅ UI design system components (Button, Input, Card, LoadingSpinner)
7. ✅ Authentication pages (Login, Signup, Admin Login)
8. ✅ Landing page connections (back to home links, brand consistency)
9. ✅ Environment variables configured

---

**Previous Phase**: [Phase 0: Landing Page & Public Interface](./phase-0.md)  
**Next Phase**: [Phase 2: Database Schema & Core Models](./phase-2.md)


