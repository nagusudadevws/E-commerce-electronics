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

