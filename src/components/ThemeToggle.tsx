'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useStore()
  
  const sizes = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8',
  }
  
  const dotSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        `relative rounded-full p-1 transition-colors duration-300
        bg-gray-200 dark:bg-gray-700`,
        sizes[size],
        className
      )}
      aria-label={theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            'bg-gradient-to-r from-amber-200 to-orange-300',
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
          )}
        />
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            'bg-gradient-to-r from-indigo-600 to-purple-700',
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>
      
      {/* Dot with icon */}
      <div
        className={cn(
          `relative rounded-full bg-white shadow-md
          flex items-center justify-center
          transition-transform duration-300`,
          dotSizes[size],
          theme === 'dark' ? 'translate-x-full' : 'translate-x-0'
        )}
      >
        <Sun 
          className={cn(
            iconSizes[size],
            'text-amber-500 transition-opacity duration-300',
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
          )} 
        />
        <Moon 
          className={cn(
            iconSizes[size],
            'text-indigo-600 absolute transition-opacity duration-300',
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          )} 
        />
      </div>
    </button>
  )
}

// Button version
export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useStore()
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        `p-2 rounded-lg transition-colors
        hover:bg-gray-100 dark:hover:bg-gray-800
        text-gray-600 dark:text-gray-400`,
        className
      )}
      aria-label={theme === 'light' ? 'Attiva tema scuro' : 'Attiva tema chiaro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
