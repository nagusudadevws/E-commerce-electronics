export type UserRole = 'admin' | 'seller' | 'customer'

export interface AuthResponse {
  user: any | null
  error: Error | null
}




