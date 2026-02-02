'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-500
      hover:from-primary-700 hover:to-primary-600
      text-white shadow-md hover:shadow-lg
      focus:ring-primary-500
      dark:from-primary-500 dark:to-primary-400
      dark:hover:from-primary-600 dark:hover:to-primary-500
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200
      text-gray-900
      dark:bg-gray-800 dark:hover:bg-gray-700
      dark:text-gray-100
      focus:ring-gray-500
    `,
    outline: `
      border-2 border-gray-300 dark:border-gray-600
      hover:border-primary-500 dark:hover:border-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      text-gray-700 dark:text-gray-200
      hover:text-primary-600 dark:hover:text-primary-400
      focus:ring-primary-500
    `,
    ghost: `
      hover:bg-gray-100 dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-200
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500
      hover:from-red-700 hover:to-red-600
      text-white shadow-md hover:shadow-lg
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-500
      hover:from-green-700 hover:to-green-600
      text-white shadow-md hover:shadow-lg
      focus:ring-green-500
    `,
  }
  
  const sizes = {
    xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2',
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
}
