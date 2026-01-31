import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import type { AuthResponse } from '@/types/auth'

export const signUp = async (
  email: string,
  password: string,
  metadata?: { role?: string; name?: string }
): Promise<AuthResponse> => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { 
      user: null, 
      error: new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local file.') 
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    
    if (error) {
      return { user: null, error: error as Error }
    }
    
    return { user: data.user, error: null }
  } catch (error: any) {
    // Handle network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return { 
        user: null, 
        error: new Error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.') 
      }
    }
    return { user: null, error: error as Error }
  }
}

export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return { 
      user: null, 
      error: new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local file.') 
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { user: null, error: error as Error }
    }
    
    return { user: data.user, error: null }
  } catch (error: any) {
    // Handle network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return { 
        user: null, 
        error: new Error('Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.') 
      }
    }
    return { user: null, error: error as Error }
  }
}

export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error: error as Error | null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })
    return { error: error as Error | null }
  } catch (error) {
    return { error: error as Error }
  }
}

