'use client'

import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Sidebar, MobileHeader } from '@/components/layout/Sidebar'
import { fetchProducts, subscribeToProducts } from '@/lib/api/products'
import { fetchCategories, fetchSubcategories, subscribeToCategories, subscribeToSubcategories } from '@/lib/api/categories'
import { cn } from '@/lib/utils'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { 
    isAuthenticated, 
    sidebarOpen,
    setProducts, 
    addProduct, 
    updateProduct, 
    removeProduct,
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    setSubcategories,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
  } = useStore()

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      const [products, categories, subcategories] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSubcategories(),
      ])
      
      setProducts(products)
      setCategories(categories)
      setSubcategories(subcategories)
    }

    loadData()
  }, [isAuthenticated, setProducts, setCategories, setSubcategories])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isAuthenticated) return

    // Products subscription
    const unsubscribeProducts = subscribeToProducts((payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) addProduct(payload.new)
          break
        case 'UPDATE':
          if (payload.new) updateProduct(payload.new)
          break
        case 'DELETE':
          if (payload.old) removeProduct(payload.old.id)
          break
      }
    })

    // Categories subscription
    const unsubscribeCategories = subscribeToCategories((payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) addCategory(payload.new)
          break
        case 'UPDATE':
          if (payload.new) updateCategory(payload.new)
          break
        case 'DELETE':
          if (payload.old) removeCategory(payload.old.id)
          break
      }
    })

    // Subcategories subscription
    const unsubscribeSubcategories = subscribeToSubcategories((payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new) addSubcategory(payload.new)
          break
        case 'UPDATE':
          if (payload.new) updateSubcategory(payload.new)
          break
        case 'DELETE':
          if (payload.old) removeSubcategory(payload.old.id)
          break
      }
    })

    return () => {
      unsubscribeProducts()
      unsubscribeCategories()
      unsubscribeSubcategories()
    }
  }, [
    isAuthenticated,
    addProduct, updateProduct, removeProduct,
    addCategory, updateCategory, removeCategory,
    addSubcategory, updateSubcategory, removeSubcategory,
  ])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MobileHeader />
      <div className="flex">
        <Sidebar />
        <main 
          className={cn(
            'flex-1 min-h-screen transition-all duration-300',
            'pt-20 lg:pt-0',
            'px-4 sm:px-6 lg:px-8 py-6'
          )}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
