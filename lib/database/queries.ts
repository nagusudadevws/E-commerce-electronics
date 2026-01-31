import { supabase } from '@/lib/supabase/client'
import type { 
  Product, 
  Order, 
  OrderItem, 
  Category, 
  Vendor, 
  Customer,
  Profile,
  ProductWithRelations,
  OrderWithItems
} from '@/types/database'

// =====================================================
// PRODUCTS
// =====================================================

export const getProducts = async (filters?: {
  categoryId?: string
  vendorId?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<Product[]> => {
  let query = supabase
    .from('products')
    .select('*')

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }
  if (filters?.vendorId) {
    query = query.eq('vendor_id', filters.vendorId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// CATEGORIES
// =====================================================

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// ORDERS
// =====================================================

export const getOrders = async (filters?: {
  customerId?: string
  vendorId?: string
  status?: string
}): Promise<Order[]> => {
  let query = supabase
    .from('orders')
    .select('*')

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId)
  }
  if (filters?.vendorId) {
    query = query.eq('vendor_id', filters.vendorId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getOrderById = async (id: string): Promise<OrderWithItems | null> => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError) {
    if (orderError.code === 'PGRST116') return null
    throw orderError
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  if (itemsError) throw itemsError

  return {
    ...order,
    items: items || []
  }
}

export const createOrder = async (order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> => {
  // Generate order number using the database function
  const { data: orderNumber, error: orderNumError } = await supabase
    .rpc('generate_order_number')

  if (orderNumError) throw orderNumError

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...order,
      order_number: orderNumber || `ORD-${Date.now()}`,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// ORDER ITEMS
// =====================================================

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) throw error
  return data || []
}

export const createOrderItem = async (item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// CUSTOMERS
// =====================================================

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const getCustomerByUserId = async (userId: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// VENDORS
// =====================================================

export const getVendors = async (): Promise<Vendor[]> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getVendorById = async (id: string): Promise<Vendor | null> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const getVendorByUserId = async (userId: string): Promise<Vendor | null> => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const createVendor = async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> => {
  const { data, error } = await supabase
    .from('vendors')
    .insert(vendor)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<Vendor> => {
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// PROFILES
// =====================================================

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

