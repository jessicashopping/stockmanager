'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Store,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Prodotti', href: '/products', icon: Package },
  { name: 'Nuovo Prodotto', href: '/products/new', icon: PlusCircle },
  { name: 'Categorie', href: '/categories', icon: FolderTree },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, sidebarOpen, setSidebarOpen } = useStore()
  
  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          `fixed top-0 left-0 z-50 h-full
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col`,
          sidebarOpen ? 'w-64' : 'w-20',
          'lg:relative',
          !sidebarOpen && 'max-lg:-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <Link 
            href="/dashboard"
            className={cn(
              'flex items-center gap-3 transition-opacity',
              !sidebarOpen && 'lg:justify-center'
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                StockManager
              </span>
            )}
          </Link>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              text-gray-500 dark:text-gray-400 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className={cn(
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group`,
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                  !sidebarOpen && 'lg:justify-center lg:px-0'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 shrink-0',
                  isActive && 'text-primary-600 dark:text-primary-400'
                )} />
                {sidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Theme Toggle */}
          <div className={cn(
            'flex items-center gap-3',
            !sidebarOpen && 'lg:justify-center'
          )}>
            <ThemeToggle size="sm" />
            {sidebarOpen && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tema
              </span>
            )}
          </div>
          
          {/* User info */}
          {user && sidebarOpen && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.display_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role === 'admin' ? 'Amministratore' : 'Utente'}
              </p>
            </div>
          )}
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={cn(
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-600 dark:text-red-400 
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors`,
              !sidebarOpen && 'lg:justify-center lg:px-0'
            )}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Esci</span>}
          </button>
          
          {/* Collapse button (desktop only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 
              rounded-xl text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className={cn(
              'w-4 h-4 transition-transform',
              !sidebarOpen && 'rotate-180'
            )} />
            {sidebarOpen && <span className="text-sm">Riduci</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

// Mobile header with menu button
export function MobileHeader() {
  const { setSidebarOpen } = useStore()
  
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 
      bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
      flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
            text-gray-600 dark:text-gray-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            StockManager
          </span>
        </div>
      </div>
    </header>
  )
}
