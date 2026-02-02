import { getSupabase } from '@/lib/supabase/client'
import type { Product, FilterOptions, BarcodeProductInfo } from '@/lib/types'

// Fetch all products with category and subcategory
export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
}

// Fetch products with filters
export async function fetchFilteredProducts(filters: FilterOptions): Promise<Product[]> {
  const supabase = getSupabase()
  
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
  
  // Apply filters
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
  }
  
  if (filters.category) {
    query = query.eq('category_id', filters.category)
  }
  
  if (filters.subcategory) {
    query = query.eq('subcategory_id', filters.subcategory)
  }
  
  if (filters.brand) {
    query = query.ilike('brand', `%${filters.brand}%`)
  }
  
  if (filters.minPrice !== undefined) {
    query = query.gte('sale_price', filters.minPrice)
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('sale_price', filters.maxPrice)
  }
  
  if (filters.minQuantity !== undefined) {
    query = query.gte('quantity', filters.minQuantity)
  }
  
  if (filters.maxQuantity !== undefined) {
    query = query.lte('quantity', filters.maxQuantity)
  }
  
  // Apply sorting
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder === 'asc' ? true : false
  query = query.order(sortBy, { ascending: sortOrder })
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching filtered products:', error)
    return []
  }
  
  return data || []
}

// Get product by ID
export async function getProduct(id: string): Promise<Product | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return data
}

// Get product by barcode
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .eq('barcode', barcode)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching product by barcode:', error)
  }
  
  return data || null
}

// Create product
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'subcategory'>): Promise<Product | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .single()
  
  if (error) {
    console.error('Error creating product:', error)
    return null
  }
  
  return data
}

// Update product
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'category' | 'subcategory'>>): Promise<Product | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .single()
  
  if (error) {
    console.error('Error updating product:', error)
    return null
  }
  
  return data
}

// Delete product
export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabase()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting product:', error)
    return false
  }
  
  return true
}

// Update product quantity
export async function updateProductQuantity(id: string, quantity: number): Promise<boolean> {
  const supabase = getSupabase()
  
  const { error } = await supabase
    .from('products')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating product quantity:', error)
    return false
  }
  
  return true
}

// Get unique brands
export async function getUniqueBrands(): Promise<string[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .not('brand', 'is', null)
    .not('brand', 'eq', '')
  
  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }
  
  const brands = [...new Set(data.map(p => p.brand))].filter(Boolean) as string[]
  return brands.sort()
}

// Lookup barcode using Open Food Facts API
export async function lookupBarcode(barcode: string): Promise<BarcodeProductInfo | null> {
  try {
    // Try Open Food Facts first
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    const data = await response.json()
    
    if (data.status === 1 && data.product) {
      const product = data.product
      return {
        name: product.product_name || product.product_name_it || product.product_name_en,
        brand: product.brands,
        description: product.generic_name || product.ingredients_text,
        image_url: product.image_url || product.image_front_url,
        category: product.categories?.split(',')[0]?.trim(),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error looking up barcode:', error)
    return null
  }
}

// Subscribe to product changes (realtime)
export function subscribeToProducts(callback: (payload: { 
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Product | null
  old: { id: string } | null 
}) => void) {
  const supabase = getSupabase()
  
  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      async (payload) => {
        let newProduct: Product | null = null
        
        if (payload.eventType !== 'DELETE' && payload.new) {
          // Fetch complete product with relations
          newProduct = await getProduct((payload.new as Product).id)
        }
        
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: newProduct,
          old: payload.old as { id: string } | null,
        })
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
