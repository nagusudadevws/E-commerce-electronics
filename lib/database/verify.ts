import { supabase } from '@/lib/supabase/client'

/**
 * Verify database schema is set up correctly
 * This function checks if all required tables exist
 */
export async function verifyDatabaseSchema(): Promise<{
  success: boolean
  tables: string[]
  missing: string[]
  errors?: string[]
}> {
  const requiredTables = [
    'profiles',
    'vendors',
    'categories',
    'products',
    'customers',
    'orders',
    'order_items'
  ]

  try {
    // Try to query each table to verify it exists
    const tableChecks = await Promise.allSettled(
      requiredTables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(0)
        
        return { table, exists: !error }
      })
    )

    const existingTables: string[] = []
    const missingTables: string[] = []
    const errors: string[] = []

    tableChecks.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.exists) {
          existingTables.push(requiredTables[index])
        } else {
          missingTables.push(requiredTables[index])
        }
      } else {
        missingTables.push(requiredTables[index])
        errors.push(`Error checking ${requiredTables[index]}: ${result.reason}`)
      }
    })

    return {
      success: missingTables.length === 0,
      tables: existingTables,
      missing: missingTables,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error: any) {
    return {
      success: false,
      tables: [],
      missing: requiredTables,
      errors: [error.message || 'Failed to verify database schema']
    }
  }
}

/**
 * Check if a specific table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0)
    
    return !error
  } catch {
    return false
  }
}


