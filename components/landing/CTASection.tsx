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


