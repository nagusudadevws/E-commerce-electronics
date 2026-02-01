export type UserRole = 'admin' | 'seller' | 'customer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  user_id: string
  business_name: string
  business_email: string
  business_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  tax_id: string | null
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  vendor_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  sku: string | null
  image_url: string | null
  status: 'active' | 'inactive' | 'out_of_stock'
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  customer_id: string | null
  vendor_id: string | null
  order_number: string
  status: OrderStatus
  total_amount: number
  shipping_address: string
  billing_address: string | null
  payment_status: PaymentStatus
  payment_method: string | null
  payment_transaction_id: string | null
  shipping_cost: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

// Extended types with relations
export interface ProductWithRelations extends Product {
  vendor?: Vendor
  category?: Category
}

export interface OrderWithItems extends Order {
  customer?: Customer
  vendor?: Vendor
  items?: OrderItem[]
}

export interface OrderItemWithProduct extends OrderItem {
  product?: Product
}


