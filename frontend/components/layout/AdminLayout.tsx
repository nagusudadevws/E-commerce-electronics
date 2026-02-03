'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth/auth-utils'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Button from '@/components/ui/Button'

interface AdminLayoutProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'seller')[]
}

export default function AdminLayout({ children, allowedRoles = ['admin', 'seller'] }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  const userRole = user?.user_metadata?.role as 'admin' | 'seller' | 'customer' | undefined
  const isSeller = userRole === 'seller'
  const dashboardHref = isSeller ? '/seller' : '/admin'

  const navigation = [
    { name: 'Dashboard', href: dashboardHref, icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '📦' },
    { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
    { name: 'Orders', href: '/admin/orders', icon: '🛒' },
    ...(userRole === 'admin' ? [
      { name: 'Vendors', href: '/admin/vendors', icon: '🏪' },
      { name: 'Customers', href: '/admin/customers', icon: '👥' }
    ] : []),
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getPageTitle = () => {
    // Handle seller dashboard route
    if (pathname === '/seller') {
      return 'Dashboard'
    }
    const currentNav = navigation.find(item => 
      pathname === item.href || pathname?.startsWith(item.href + '/')
    )
    return currentNav?.name || 'Dashboard'
  }

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <Link href={dashboardHref} className="text-xl font-bold text-gray-900">
                {isSeller ? 'Seller Dashboard' : 'E-Commerce Admin'}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200">
              <div className="mb-2 px-2">
                <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.email || 'Loading...'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Toggle sidebar"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {getPageTitle()}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline">
                    View Site
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

