# Phase 0: Landing Page & Public Interface

---

## Overview

This phase creates the public-facing landing page and establishes the first impression of the e-commerce platform. The landing page serves as the entry point for all users (customers, sellers, and admins) and provides navigation to key sections of the platform.

**Duration Estimate**: 2-3 days  
**Dependencies**: None (initial phase)

---

## Goals

1. Design and build a modern, professional landing page
2. Create navigation structure for the entire platform
3. Implement hero section with clear value proposition
4. Build feature showcase sections
5. Add call-to-action buttons linking to authentication and catalog
6. Create footer with important links and information
7. Ensure responsive design across all devices
8. Establish brand identity and visual design language

---

## Features & Components to Develop

### 1. Landing Page Sections
- Header with navigation
- Hero section
- Features showcase
- Product categories preview
- Statistics/Trust indicators
- Testimonials (optional)
- Call-to-action sections
- Footer

### 2. Navigation Components
- Main navigation menu
- Mobile hamburger menu
- User account menu (when logged in)
- Admin/Seller login link
- Customer login/signup links

### 3. Public Pages
- Landing page (home)
- About page (optional)
- Contact page (optional)
- Terms of Service page
- Privacy Policy page

### 4. UI Components
- Navigation bar
- Hero section component
- Feature cards
- Category cards
- Statistics cards
- Footer component
- CTA buttons

---

## Technical Implementation Details

### Landing Page Structure

#### 1. Header/Navigation Bar

**File: `components/layout/Header.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Button from '@/components/ui/Button'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserRole = () => {
    return user?.user_metadata?.role || 'customer'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">ElectroIoT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/catalog" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Products
            </Link>
            <Link href="/#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="/#categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${getUserRole()}`}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/catalog" className="block text-gray-700 hover:text-blue-600 font-medium">
              Products
            </Link>
            <Link href="/#features" className="block text-gray-700 hover:text-blue-600 font-medium">
              Features
            </Link>
            <Link href="/#categories" className="block text-gray-700 hover:text-blue-600 font-medium">
              Categories
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-blue-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-blue-600 font-medium">
              Contact
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Link href={`/${getUserRole()}`} className="block text-gray-700 hover:text-blue-600 font-medium">
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                  <Link href="/admin/login" className="block text-sm text-gray-600 hover:text-gray-900 text-center">
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
```

#### 2. Hero Section

**File: `components/landing/HeroSection.tsx`**

```typescript
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Electronics & IoT Devices
            <span className="block text-blue-600 mt-2">For the Modern World</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover cutting-edge electronics and IoT solutions from trusted vendors. 
            Shop the latest technology with secure payments and fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Products
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### 3. Features Section

**File: `components/landing/FeaturesSection.tsx`**

```typescript
import Card from '@/components/ui/Card'

const features = [
  {
    icon: '🚀',
    title: 'Fast Delivery',
    description: 'Quick and reliable shipping to get your products to you fast.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: 'Your payment information is protected with industry-leading security.',
  },
  {
    icon: '📦',
    title: 'Wide Selection',
    description: 'Thousands of electronics and IoT devices from trusted vendors.',
  },
  {
    icon: '⭐',
    title: 'Quality Guaranteed',
    description: 'All products are verified for quality and authenticity.',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    description: 'Hassle-free returns and exchanges within 30 days.',
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'Our support team is always here to help you.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide the best shopping experience for electronics and IoT enthusiasts.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 4. Categories Preview Section

**File: `components/landing/CategoriesSection.tsx`**

```typescript
import Link from 'next/link'
import Card from '@/components/ui/Card'

const categories = [
  {
    name: 'Smart Home',
    description: 'Automate your home with smart devices',
    icon: '🏠',
    href: '/catalog?category=smart-home',
  },
  {
    name: 'Wearables',
    description: 'Smart watches and fitness trackers',
    icon: '⌚',
    href: '/catalog?category=wearables',
  },
  {
    name: 'IoT Sensors',
    description: 'Environmental and motion sensors',
    icon: '📡',
    href: '/catalog?category=sensors',
  },
  {
    name: 'Electronics',
    description: 'Components and accessories',
    icon: '🔌',
    href: '/catalog?category=electronics',
  },
]

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of electronics and IoT product categories.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card className="p-6 text-center hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/catalog">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

#### 5. Statistics Section

**File: `components/landing/StatsSection.tsx`**

```typescript
const stats = [
  { value: '10,000+', label: 'Products' },
  { value: '500+', label: 'Vendors' },
  { value: '50,000+', label: 'Happy Customers' },
  { value: '99.9%', label: 'Uptime' },
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-blue-100 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 6. Call-to-Action Section

**File: `components/landing/CTASection.tsx`**

```typescript
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of customers and start shopping for the latest electronics and IoT devices today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
          <Link href="/catalog">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

#### 7. Footer Component

**File: `components/layout/Footer.tsx`**

```typescript
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">ElectroIoT</h3>
            <p className="text-sm">
              Your trusted source for electronics and IoT devices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ElectroIoT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

#### 8. Main Landing Page

**File: `app/page.tsx`**

```typescript
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import CategoriesSection from '@/components/landing/CategoriesSection'
import StatsSection from '@/components/landing/StatsSection'
import CTASection from '@/components/landing/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
```

### Additional Public Pages

#### 9. About Page

**File: `app/about/page.tsx`**

```typescript
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-4">
                ElectroIoT is a leading multi-vendor e-commerce platform specializing in 
                electronics and IoT devices. We connect customers with trusted vendors 
                offering the latest technology solutions.
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                To provide a seamless shopping experience for electronics enthusiasts 
                while supporting vendors in reaching their customers effectively.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

#### 10. Contact Page

**File: `app/contact/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
            {submitted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Thank you for your message! We'll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

#### 11. Terms of Service Page

**File: `app/terms/page.tsx`**

```typescript
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              {/* Add terms content here */}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

#### 12. Privacy Policy Page

**File: `app/privacy/page.tsx`**

```typescript
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              {/* Add privacy policy content here */}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

---

## Connection to Next Phase

**Phase 0 → Phase 1**:
- Landing page provides navigation links to login/signup pages
- Header includes "Admin Login" link that routes to `/admin/login`
- Sign up button links to `/signup` page (implemented in Phase 1)
- Sign in button links to `/login` page (implemented in Phase 1)
- "Browse Products" button links to `/catalog` (implemented in Phase 5)

---

## Testing Checklist

- [ ] Landing page loads correctly
- [ ] All navigation links work
- [ ] Header displays correctly on desktop and mobile
- [ ] Mobile menu toggles correctly
- [ ] Hero section displays properly
- [ ] Features section renders all features
- [ ] Categories section links work
- [ ] Statistics section displays correctly
- [ ] CTA buttons link to correct pages
- [ ] Footer displays all links
- [ ] About page loads
- [ ] Contact page form works
- [ ] Terms and Privacy pages load
- [ ] Responsive design works on all screen sizes
- [ ] Admin login link visible in header
- [ ] User menu appears when logged in

---

## Deliverables Summary

1. ✅ Landing page with all sections
2. ✅ Header/Navigation component
3. ✅ Footer component
4. ✅ Hero section
5. ✅ Features showcase
6. ✅ Categories preview
7. ✅ Statistics section
8. ✅ Call-to-action sections
9. ✅ About page
10. ✅ Contact page
11. ✅ Terms of Service page
12. ✅ Privacy Policy page
13. ✅ Responsive design
14. ✅ Navigation to authentication pages
15. ✅ Admin login link in header

---

**Next Phase**: [Phase 1: Project Setup & Authentication Foundation](./phase-1.md)

