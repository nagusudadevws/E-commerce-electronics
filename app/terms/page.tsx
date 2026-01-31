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
              <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using ElectroIoT, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily use ElectroIoT for personal, non-commercial 
                transitory viewing only.
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account and password 
                and for restricting access to your computer.
              </p>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Products and Services</h2>
              <p className="mb-4">
                We reserve the right to limit the quantities of any products or services that we offer.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

