'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  const variants = {
    default: `
      bg-white dark:bg-gray-800/50
      border border-gray-200 dark:border-gray-700/50
    `,
    bordered: `
      bg-white dark:bg-gray-800/50
      border-2 border-gray-200 dark:border-gray-700
    `,
    elevated: `
      bg-white dark:bg-gray-800
      shadow-soft dark:shadow-none
      border border-gray-100 dark:border-gray-700/50
    `,
    gradient: `
      bg-gradient-to-br from-white to-gray-50
      dark:from-gray-800 dark:to-gray-900
      border border-gray-200 dark:border-gray-700/50
    `,
  }
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl transition-all duration-200',
        variants[variant],
        paddings[padding],
        hoverable && 'cursor-pointer hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700/50 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  subtitle?: string
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div>
      <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}>
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  )
}
