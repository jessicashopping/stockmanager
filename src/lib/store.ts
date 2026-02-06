import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product, Category, Subcategory, User, FilterOptions, DashboardStats } from './types'

interface AppState {
  // Hydration state
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // Theme
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void

  // Auth
  user: User | null
  isAuthenticated: boolean
  sessionToken: string | null
  setUser: (user: User | null) => void
  setSessionToken: (token: string | null) => void
  logout: () => void

  // Products
  products: Product[]
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  removeProduct: (id: string) => void

  // Categories
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  removeCategory: (id: string) => void

  // Subcategories
  subcategories: Subcategory[]
  setSubcategories: (subcategories: Subcategory[]) => void
  addSubcategory: (subcategory: Subcategory) => void
  updateSubcategory: (subcategory: Subcategory) => void
  removeSubcategory: (id: string) => void

  // Filters
  filters: FilterOptions
  setFilters: (filters: FilterOptions) => void
  resetFilters: () => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Dashboard Stats
  stats: DashboardStats | null
  setStats: (stats: DashboardStats) => void
}

const defaultFilters: FilterOptions = {
  search: '',
  category: '',
  subcategory: '',
  brand: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Theme
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }
      },
      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      // Auth
      user: null,
      isAuthenticated: false,
      sessionToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSessionToken: (token) => set({ sessionToken: token }),
      logout: () => set({ user: null, isAuthenticated: false, sessionToken: null }),

      // Products
      products: [],
      setProducts: (products) => set({ products }),
      addProduct: (product) => set((state) => ({ 
        products: [product, ...state.products] 
      })),
      updateProduct: (product) => set((state) => ({
        products: state.products.map((p) => p.id === product.id ? product : p)
      })),
      removeProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),

      // Categories
      categories: [],
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      updateCategory: (category) => set((state) => ({
        categories: state.categories.map((c) => c.id === category.id ? category : c)
      })),
      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      })),

      // Subcategories
      subcategories: [],
      setSubcategories: (subcategories) => set({ subcategories }),
      addSubcategory: (subcategory) => set((state) => ({
        subcategories: [...state.subcategories, subcategory]
      })),
      updateSubcategory: (subcategory) => set((state) => ({
        subcategories: state.subcategories.map((s) => s.id === subcategory.id ? subcategory : s)
      })),
      removeSubcategory: (id) => set((state) => ({
        subcategories: state.subcategories.filter((s) => s.id !== id)
      })),

      // Filters
      filters: defaultFilters,
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      resetFilters: () => set({ filters: defaultFilters }),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Dashboard Stats
      stats: null,
      setStats: (stats) => set({ stats }),
    }),
    {
      name: 'stockmanager-storage',
      storage: createJSONStorage(() => {
        // Safe localStorage wrapper for mobile browsers
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        try {
          // Test if localStorage is available
          const testKey = '__storage_test__'
          window.localStorage.setItem(testKey, testKey)
          window.localStorage.removeItem(testKey)
          return window.localStorage
        } catch (e) {
          // Fallback to memory storage if localStorage is blocked
          console.warn('localStorage not available, using memory storage')
          const memoryStorage: Record<string, string> = {}
          return {
            getItem: (name: string) => memoryStorage[name] || null,
            setItem: (name: string, value: string) => { memoryStorage[name] = value },
            removeItem: (name: string) => { delete memoryStorage[name] },
          }
        }
      }),
      partialize: (state) => ({
        theme: state.theme,
        sessionToken: state.sessionToken,
        sidebarOpen: state.sidebarOpen,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Initialize theme on client
export function initializeTheme() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('stockmanager-storage')
    if (stored) {
      try {
        const { state } = JSON.parse(stored)
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      } catch (e) {
        console.error('Error parsing stored theme:', e)
      }
    }
  }
}
