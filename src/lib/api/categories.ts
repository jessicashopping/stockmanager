import { getSupabase } from '@/lib/supabase/client'
import type { Category, Subcategory } from '@/lib/types'

// ============ CATEGORIES ============

// Fetch all categories
export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data || []
}

// Get category by ID
export async function getCategory(id: string): Promise<Category | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching category:', error)
    return null
  }
  
  return data
}

// Create category
export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating category:', error)
    return null
  }
  
  return data
}

// Update category
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating category:', error)
    return null
  }
  
  return data
}

// Delete category
export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getSupabase()
  
  // First, check if there are products using this category
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1)
  
  if (products && products.length > 0) {
    console.error('Cannot delete category: products are using it')
    return false
  }
  
  // Delete subcategories first
  await supabase
    .from('subcategories')
    .delete()
    .eq('category_id', id)
  
  // Delete category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting category:', error)
    return false
  }
  
  return true
}

// Get category product count
export async function getCategoryProductCount(id: string): Promise<number> {
  const supabase = getSupabase()
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
  
  if (error) {
    console.error('Error counting products:', error)
    return 0
  }
  
  return count || 0
}

// Subscribe to category changes (realtime)
export function subscribeToCategories(callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Category | null
  old: { id: string } | null
}) => void) {
  const supabase = getSupabase()
  
  const channel = supabase
    .channel('categories-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Category | null,
          old: payload.old as { id: string } | null,
        })
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// ============ SUBCATEGORIES ============

// Fetch all subcategories
export async function fetchSubcategories(): Promise<Subcategory[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('subcategories')
    .select(`
      *,
      category:categories(*)
    `)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
  
  return data || []
}

// Fetch subcategories by category
export async function fetchSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('subcategories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', categoryId)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
  
  return data || []
}

// Get subcategory by ID
export async function getSubcategory(id: string): Promise<Subcategory | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('subcategories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching subcategory:', error)
    return null
  }
  
  return data
}

// Create subcategory
export async function createSubcategory(subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Subcategory | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('subcategories')
    .insert(subcategory)
    .select(`
      *,
      category:categories(*)
    `)
    .single()
  
  if (error) {
    console.error('Error creating subcategory:', error)
    return null
  }
  
  return data
}

// Update subcategory
export async function updateSubcategory(id: string, updates: Partial<Omit<Subcategory, 'id' | 'created_at' | 'category'>>): Promise<Subcategory | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('subcategories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single()
  
  if (error) {
    console.error('Error updating subcategory:', error)
    return null
  }
  
  return data
}

// Delete subcategory
export async function deleteSubcategory(id: string): Promise<boolean> {
  const supabase = getSupabase()
  
  // First, check if there are products using this subcategory
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('subcategory_id', id)
    .limit(1)
  
  if (products && products.length > 0) {
    console.error('Cannot delete subcategory: products are using it')
    return false
  }
  
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting subcategory:', error)
    return false
  }
  
  return true
}

// Get subcategory product count
export async function getSubcategoryProductCount(id: string): Promise<number> {
  const supabase = getSupabase()
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('subcategory_id', id)
  
  if (error) {
    console.error('Error counting products:', error)
    return 0
  }
  
  return count || 0
}

// Subscribe to subcategory changes (realtime)
export function subscribeToSubcategories(callback: (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Subcategory | null
  old: { id: string } | null
}) => void) {
  const supabase = getSupabase()
  
  const channel = supabase
    .channel('subcategories-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'subcategories' },
      async (payload) => {
        let newSubcategory: Subcategory | null = null
        
        if (payload.eventType !== 'DELETE' && payload.new) {
          newSubcategory = await getSubcategory((payload.new as Subcategory).id)
        }
        
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: newSubcategory,
          old: payload.old as { id: string } | null,
        })
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
