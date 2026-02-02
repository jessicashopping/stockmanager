'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { fetchDashboardStats, fetchCategoryStats } from '@/lib/api/dashboard'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '@/components/ui'
import { formatCurrency, formatRelativeTime, getStockStatus, getStockStatusColor, getStockStatusBg, cn } from '@/lib/utils'
import type { DashboardStats, Product } from '@/lib/types'
import {
  Package,
  DollarSign,
  TrendingUp,
  FolderTree,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Tag,
  BarChart3,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function DashboardPage() {
  const { products, categories, subcategories } = useStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [categoryStats, setCategoryStats] = useState<{ name: string; color: string; count: number; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dashStats, catStats] = await Promise.all([
          fetchDashboardStats(),
          fetchCategoryStats(),
        ])
        setStats(dashStats)
        setCategoryStats(catStats)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [products]) // Reload when products change

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  const profit = (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0)
  const profitMargin = stats?.totalPurchaseValue 
    ? ((profit / stats.totalPurchaseValue) * 100).toFixed(1) 
    : '0'

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Panoramica del tuo inventario
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 
            bg-gradient-to-r from-primary-600 to-primary-500 
            hover:from-primary-700 hover:to-primary-600
            text-white font-medium rounded-xl shadow-lg shadow-primary-500/25
            transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Package className="w-5 h-5" />
          Nuovo Prodotto
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Prodotti Totali"
          value={stats?.totalProducts || 0}
          icon={<Package className="w-5 h-5" />}
          color="blue"
          trend={`${categories.length} categorie`}
        />
        <StatCard
          title="Valore Magazzino"
          value={formatCurrency(stats?.totalPurchaseValue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          trend="Costo acquisto"
        />
        <StatCard
          title="Valore Vendita"
          value={formatCurrency(stats?.totalSaleValue || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          trend={`Margine ${profitMargin}%`}
        />
        <StatCard
          title="Avvisi Scorte"
          value={(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats?.outOfStockProducts ? 'red' : 'yellow'}
          trend={`${stats?.outOfStockProducts || 0} esauriti`}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Chart */}
        <Card className="lg:col-span-2" variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Distribuzione per categoria">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Valore per Categoria
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `€${v}`}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valore']}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        borderRadius: '0.75rem',
                        border: 'none',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Nessun dato disponibile
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Pie */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Prodotti per categoria">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary-500" />
                Distribuzione
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, 'Prodotti']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Nessun dato
              </div>
            )}
            {/* Legend */}
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {categoryStats.map((cat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card variant="elevated">
          <CardHeader
            action={
              <Link 
                href="/products" 
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Vedi tutti <ArrowUpRight className="w-4 h-4" />
              </Link>
            }
          >
            <CardTitle subtitle="Ultimi aggiornamenti">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Attività Recente
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentProducts && stats.recentProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentProducts.slice(0, 5).map((product) => (
                  <RecentProductItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nessun prodotto recente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card variant="elevated">
          <CardHeader
            action={
              <Link 
                href="/products?filter=low" 
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Vedi tutti <ArrowUpRight className="w-4 h-4" />
              </Link>
            }
          >
            <CardTitle subtitle="Prodotti da riordinare">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Avvisi Scorte
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.filter(p => p.quantity <= p.min_quantity).length > 0 ? (
              <div className="space-y-3">
                {products
                  .filter(p => p.quantity <= p.min_quantity)
                  .slice(0, 5)
                  .map((product) => (
                    <StockAlertItem key={product.id} product={product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Nessun avviso di scorta
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Categorie</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {subcategories.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sottocategorie</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(profit)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Profitto Potenziale</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {products.reduce((sum, p) => sum + p.quantity, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unità Totali</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    green: 'from-green-500 to-green-600 shadow-green-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-500/25',
    red: 'from-red-500 to-red-600 shadow-red-500/25',
  }

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
          colors[color]
        )}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {title}
        </p>
        {trend && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}

// Recent Product Item
function RecentProductItem({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-3 p-3 rounded-xl 
        hover:bg-gray-50 dark:hover:bg-gray-800/50 
        transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {product.brand} • {formatCurrency(product.sale_price)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {formatRelativeTime(product.updated_at)}
        </p>
      </div>
    </Link>
  )
}

// Stock Alert Item
function StockAlertItem({ product }: { product: Product }) {
  const status = getStockStatus(product.quantity, product.min_quantity)
  
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex items-center gap-3 p-3 rounded-xl 
        hover:bg-gray-50 dark:hover:bg-gray-800/50 
        transition-colors group"
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        getStockStatusBg(status)
      )}>
        <AlertTriangle className={cn('w-5 h-5', getStockStatusColor(status))} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Minimo: {product.min_quantity} unità
        </p>
      </div>
      <div className="text-right">
        <Badge variant={status === 'out' ? 'danger' : 'warning'} size="sm">
          {product.quantity} {status === 'out' ? 'esaurito' : 'rimanenti'}
        </Badge>
      </div>
    </Link>
  )
}
