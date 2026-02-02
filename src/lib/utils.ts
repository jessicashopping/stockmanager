// Format currency in EUR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Format date in Italian locale
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Format datetime in Italian locale
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Adesso'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min fa`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} giorni fa`
  
  return formatDate(date)
}

// Validate barcode format (EAN-13, EAN-8, UPC-A)
export function isValidBarcode(barcode: string): boolean {
  // Remove any spaces or dashes
  const cleaned = barcode.replace(/[\s-]/g, '')
  
  // Check if it's a valid length and contains only digits
  if (!/^\d+$/.test(cleaned)) return false
  if (![8, 12, 13, 14].includes(cleaned.length)) return false
  
  return true
}

// Calculate EAN-13 check digit
export function calculateEAN13CheckDigit(barcode: string): number {
  const digits = barcode.slice(0, 12).split('').map(Number)
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3)
  }, 0)
  return (10 - (sum % 10)) % 10
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Parse number safely
export function parseNumber(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') return value
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

// Calculate profit margin
export function calculateMargin(purchasePrice: number, salePrice: number): number {
  if (purchasePrice === 0) return 100
  return ((salePrice - purchasePrice) / purchasePrice) * 100
}

// Calculate profit
export function calculateProfit(purchasePrice: number, salePrice: number, quantity: number = 1): number {
  return (salePrice - purchasePrice) * quantity
}

// Get stock status
export function getStockStatus(quantity: number, minQuantity: number): 'ok' | 'low' | 'out' {
  if (quantity === 0) return 'out'
  if (quantity <= minQuantity) return 'low'
  return 'ok'
}

// Get stock status color
export function getStockStatusColor(status: 'ok' | 'low' | 'out'): string {
  switch (status) {
    case 'ok': return 'text-green-600 dark:text-green-400'
    case 'low': return 'text-yellow-600 dark:text-yellow-400'
    case 'out': return 'text-red-600 dark:text-red-400'
  }
}

// Get stock status background
export function getStockStatusBg(status: 'ok' | 'low' | 'out'): string {
  switch (status) {
    case 'ok': return 'bg-green-100 dark:bg-green-900/30'
    case 'low': return 'bg-yellow-100 dark:bg-yellow-900/30'
    case 'out': return 'bg-red-100 dark:bg-red-900/30'
  }
}

// Category colors
export const categoryColors = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
]

// Category icons (using Lucide icon names)
export const categoryIcons = [
  'package',
  'shopping-bag',
  'shopping-cart',
  'box',
  'archive',
  'tag',
  'gift',
  'star',
  'heart',
  'sparkles',
  'zap',
  'flame',
  'droplets',
  'leaf',
  'sun',
  'moon',
  'cloud',
  'coffee',
  'utensils',
  'pill',
  'shirt',
  'home',
  'car',
  'plane',
  'phone',
  'laptop',
  'tv',
  'music',
  'book',
  'pen',
]

// Get random color
export function getRandomColor(): string {
  return categoryColors[Math.floor(Math.random() * categoryColors.length)]
}

// Get random icon
export function getRandomIcon(): string {
  return categoryIcons[Math.floor(Math.random() * categoryIcons.length)]
}

// Class name merge utility
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
