import { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/auth'

export const getUserRole = (user: User | null): UserRole | null => {
  if (!user) return null
  return (user.user_metadata?.role as UserRole) || 'customer'
}

export const isAdmin = (user: User | null): boolean => {
  return getUserRole(user) === 'admin'
}

export const isSeller = (user: User | null): boolean => {
  return getUserRole(user) === 'seller'
}

export const isCustomer = (user: User | null): boolean => {
  return getUserRole(user) === 'customer'
}

export const hasRole = (user: User | null, role: UserRole): boolean => {
  return getUserRole(user) === role
}




