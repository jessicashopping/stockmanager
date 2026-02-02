'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Package, FolderOpen, Search, AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'default' | 'search' | 'error'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const defaultIcons = {
    default: <Package className="w-12 h-12" />,
    search: <Search className="w-12 h-12" />,
    error: <AlertCircle className="w-12 h-12" />,
  }
  
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function EmptyProducts({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="w-12 h-12" />}
      title="Nessun prodotto"
      description="Non ci sono ancora prodotti nel tuo inventario. Inizia aggiungendo il primo prodotto."
      action={onAdd ? { label: 'Aggiungi prodotto', onClick: onAdd } : undefined}
    />
  )
}

export function EmptySearch() {
  return (
    <EmptyState
      variant="search"
      title="Nessun risultato"
      description="La tua ricerca non ha prodotto risultati. Prova a modificare i filtri o il termine di ricerca."
    />
  )
}

export function EmptyCategories({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-12 h-12" />}
      title="Nessuna categoria"
      description="Crea le categorie per organizzare meglio i tuoi prodotti."
      action={onAdd ? { label: 'Crea categoria', onClick: onAdd } : undefined}
    />
  )
}
