# Phase 2: Database Schema & Core Models

---

## Overview

This phase focuses on designing and implementing the complete database schema for the multi-vendor e-commerce platform. We'll create all necessary tables, establish relationships, implement Row Level Security (RLS) policies, and generate TypeScript types that match the database structure.

**Duration Estimate**: 2-3 days  
**Dependencies**: Phase 1 (requires Supabase setup and authentication system)

---

## Goals

1. Design complete database schema with all required tables
2. Create database migrations in Supabase
3. Implement Row Level Security (RLS) policies for data access control
4. Generate TypeScript types/interfaces matching database schema
5. Create database seed scripts for testing (optional)
6. Set up database indexes for performance optimization

---

## Features & Components to Develop

### 1. Database Schema Design
- Users table (extends Supabase auth.users)
- Vendors table
- Products table
- Categories table
- Orders table
- Order Items table
- Customers table (extends users)

### 2. Database Relationships
- Foreign key constraints
- Cascade delete rules
- Referential integrity

### 3. Row Level Security (RLS) Policies
- Admin access policies
- Seller access policies
- Customer access policies
- Public access policies (for product catalog)

### 4. TypeScript Type Definitions
- Database table types
- API response types
- Form input types

### 5. Database Utilities
- Connection helpers
- Query builders
- Migration scripts

---

## Technical Implementation Details

### Database Schema

#### 1. Users Table (extends Supabase auth.users)

The `auth.users` table is managed by Supabase. We'll create a `profiles` table to extend it:

```sql
-- Create profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'seller', 'customer')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 2. Vendors Table

```sql
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  tax_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own vendor profile"
  ON vendors FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Vendors can update own vendor profile"
  ON vendors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendors"
  ON vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 3. Categories Table

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin/seller write)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and sellers can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'seller')
    )
  );
```

#### 4. Products Table

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT UNIQUE,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, slug)
);

-- Create indexes for performance
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Vendors can manage own products"
  ON products FOR ALL
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 5. Customers Table

```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 6. Orders Table

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'packed', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address TEXT NOT NULL,
  billing_address TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_transaction_id TEXT,
  shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view own orders"
  ON orders FOR SELECT
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Vendors can update own order status"
  ON orders FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 7. Order Items Table

```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items (inherit from orders)
CREATE POLICY "Users can view order items for accessible orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        )
        OR orders.vendor_id IN (
          SELECT id FROM vendors WHERE user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );
```

#### 8. Helper Functions

```sql
-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
BEGIN
  new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### TypeScript Type Definitions

#### File: `types/database.ts`

```typescript
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
```

### Database Utility Functions

#### File: `lib/database/queries.ts`

```typescript
import { supabase } from '@/lib/supabase/client'
import type { 
  Product, 
  Order, 
  OrderItem, 
  Category, 
  Vendor, 
  Customer,
  ProductWithRelations,
  OrderWithItems
} from '@/types/database'

// Products
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

  if (error) throw error
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

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

// Orders
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

  if (orderError) throw orderError

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

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
```

### Migration Script

Create a SQL migration file that can be run in Supabase SQL Editor:

**File: `supabase/migrations/001_initial_schema.sql`**

(Include all the SQL from the schema section above)

---

## Connection to Previous Phase

**Phase 1 → Phase 2**:
- Authentication system from Phase 1 provides user context for RLS policies
- User roles (admin, seller, customer) determine database access patterns
- Supabase client setup enables database operations
- TypeScript foundation supports type-safe database queries

---

## Connection to Next Phase

**Phase 2 → Phase 3**:
- Database schema provides product and category models
- RLS policies ensure secure data access
- TypeScript types enable type-safe API development
- Query utilities support admin dashboard data fetching

---

## Testing Checklist

- [ ] All tables created successfully in Supabase
- [ ] Foreign key constraints work correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Admins can access all data
- [ ] Sellers can only access their own products/orders
- [ ] Customers can only access their own data
- [ ] Public can view active products and categories
- [ ] TypeScript types match database schema
- [ ] Query functions work correctly
- [ ] Indexes improve query performance

---

## Deliverables Summary

1. ✅ Complete database schema (7 tables)
2. ✅ Row Level Security policies implemented
3. ✅ Database indexes for performance
4. ✅ TypeScript type definitions
5. ✅ Database utility functions
6. ✅ Migration scripts
7. ✅ Helper functions and triggers

---

**Previous Phase**: [Phase 1: Project Setup & Authentication](./phase-1.md)  
**Next Phase**: [Phase 3: Admin Dashboard & Product Management](./phase-3.md)



