import { getSupabase } from '@/lib/supabase/client'
import type { DashboardStats, Product } from '@/lib/types'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase()
  
  // Fetch all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
  
  if (productsError) {
    console.error('Error fetching products for stats:', productsError)
    throw productsError
  }
  
  // Fetch categories count
  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
  
  // Fetch subcategories count
  const { count: subcategoriesCount } = await supabase
    .from('subcategories')
    .select('*', { count: 'exact', head: true })
  
  // Calculate stats
  const allProducts = products || []
  
  const totalProducts = allProducts.length
  const totalCategories = categoriesCount || 0
  const totalSubcategories = subcategoriesCount || 0
  
  const totalPurchaseValue = allProducts.reduce((sum, p) => sum + (p.purchase_price * p.quantity), 0)
  const totalSaleValue = allProducts.reduce((sum, p) => sum + (p.sale_price * p.quantity), 0)
  
  const outOfStockProducts = allProducts.filter(p => p.quantity === 0).length
  const lowStockProducts = allProducts.filter(p => p.quantity > 0 && p.quantity <= p.min_quantity).length
  
  // Get recent products (last 10)
  const recentProducts = allProducts
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
  
  return {
    totalProducts,
    totalCategories,
    totalSubcategories,
    totalPurchaseValue,
    totalSaleValue,
    lowStockProducts,
    outOfStockProducts,
    recentProducts: recentProducts as Product[],
  }
}

// Get stock alerts (low and out of stock products)
export async function fetchStockAlerts(): Promise<Product[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .or('quantity.eq.0,quantity.lte.min_quantity')
    .order('quantity', { ascending: true })
  
  if (error) {
    console.error('Error fetching stock alerts:', error)
    return []
  }
  
  return data || []
}

// Get top selling products by value
export async function fetchTopProducts(limit: number = 5): Promise<Product[]> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*)
    `)
    .gt('quantity', 0)
    .order('sale_price', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching top products:', error)
    return []
  }
  
  return data || []
}

// Get category stats
export async function fetchCategoryStats(): Promise<{
  name: string
  color: string
  count: number
  value: number
}[]> {
  const supabase = getSupabase()
  
  // Fetch categories with products
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
  
  const { data: products } = await supabase
    .from('products')
    .select('category_id, quantity, sale_price')
  
  if (!categories || !products) return []
  
  return categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id)
    return {
      name: cat.name,
      color: cat.color,
      count: catProducts.length,
      value: catProducts.reduce((sum, p) => sum + (p.sale_price * p.quantity), 0),
    }
  }).filter(c => c.count > 0)
}
