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

