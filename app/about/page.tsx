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
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Vision</h2>
              <p className="text-gray-600 mb-4">
                To become the go-to platform for electronics and IoT devices, known for 
                quality, reliability, and exceptional customer service.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}


