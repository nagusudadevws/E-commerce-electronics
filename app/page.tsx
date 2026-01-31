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

