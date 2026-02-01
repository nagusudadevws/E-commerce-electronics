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
    console.log('Attempting signup for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
      },
    })
    
    if (error) {
      console.error('Signup error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      
      // Handle rate limit errors specifically
      if (error.message?.toLowerCase().includes('rate limit') || 
          error.message?.toLowerCase().includes('too many requests') ||
          error.status === 429) {
        return { 
          user: null, 
          error: new Error('Email rate limit exceeded. Please wait a few minutes before trying again, or disable email confirmation in Supabase settings for development.') 
        }
      }
      
      return { user: null, error: error as Error }
    }
    
    console.log('Signup response:', { 
      user: data.user ? 'User created' : 'No user (email confirmation required)',
      session: data.session ? 'Session created' : 'No session'
    })

    // Note: If email confirmation is required, data.user might be null
    // but the signup was successful - user needs to confirm email
    if (!data.user && !error) {
      // This means email confirmation is required
      return { 
        user: null, 
        error: new Error('Please check your email to confirm your account before signing in.') 
      }
    }

    // Ensure profile is created (fallback if trigger didn't fire)
    if (data.user) {
      try {
        // Wait a bit for the trigger to fire
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // If profile doesn't exist, create it manually
        if (!existingProfile && !profileCheckError) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: metadata?.name || null,
              role: (metadata?.role as 'admin' | 'seller' | 'customer') || 'customer',
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Don't fail signup if profile creation fails, but log it
          }
        }
      } catch (profileErr: any) {
        console.error('Error checking/creating profile:', profileErr)
        // Don't fail signup if profile check fails
      }
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

