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


