export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  name: string
  category_id: string
  description?: string
  created_at: string
  updated_at: string
  category?: Category
}

export interface Product {
  id: string
  name: string
  brand: string
  barcode?: string
  quantity: number
  min_quantity: number
  purchase_price: number
  sale_price: number
  category_id: string
  subcategory_id?: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
  category?: Category
  subcategory?: Subcategory
}

export interface User {
  id: string
  username: string
  password_hash: string
  display_name: string
  role: 'admin' | 'user'
  created_at: string
  last_login?: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalSubcategories: number
  totalPurchaseValue: number
  totalSaleValue: number
  lowStockProducts: number
  outOfStockProducts: number
  recentProducts: Product[]
}

export interface FilterOptions {
  search?: string
  category?: string
  subcategory?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  minQuantity?: number
  maxQuantity?: number
  sortBy?: 'name' | 'brand' | 'quantity' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface BarcodeProductInfo {
  name?: string
  brand?: string
  description?: string
  image_url?: string
  category?: string
}
