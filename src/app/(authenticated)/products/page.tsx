'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { deleteProduct, getProductByBarcode } from '@/lib/api/products'
import { Button, Input, Select, Card, Badge, Modal, ConfirmModal, EmptyProducts, EmptySearch } from '@/components/ui'
import { BarcodeScannerModal } from '@/components/BarcodeScanner'
import { showSuccess, showError } from '@/components/ui/Toast'
import { formatCurrency, getStockStatus, getStockStatusColor, getStockStatusBg, cn } from '@/lib/utils'
import type { Product, FilterOptions } from '@/lib/types'
import { Search, Plus, Edit2, Trash2, Barcode, X, Package, Eye, SlidersHorizontal } from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const { products, categories, subcategories, removeProduct } = useStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    subcategory: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null })
  const [productPreview, setProductPreview] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query)
      )
    }
    if (filters.category) result = result.filter(p => p.category_id === filters.category)
    if (filters.subcategory) result = result.filter(p => p.subcategory_id === filters.subcategory)
    
    result.sort((a, b) => {
      let cmp = 0
      switch (filters.sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'brand': cmp = a.brand.localeCompare(b.brand); break
        case 'quantity': cmp = a.quantity - b.quantity; break
        case 'price': cmp = a.sale_price - b.sale_price; break
        default: cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp
    })
    return result
  }, [products, searchQuery, filters])

  const filteredSubcategories = useMemo(() => {
    if (!filters.category) return subcategories
    return subcategories.filter(s => s.category_id === filters.category)
  }, [subcategories, filters.category])

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false)
    const localProduct = products.find(p => p.barcode === barcode)
    if (localProduct) { setProductPreview(localProduct); return }
    const dbProduct = await getProductByBarcode(barcode)
    if (dbProduct) setProductPreview(dbProduct)
    else router.push(`/products/new?barcode=${barcode}`)
  }

  const handleDelete = async () => {
    if (!deleteModal.product) return
    setIsDeleting(true)
    try {
      const success = await deleteProduct(deleteModal.product.id)
      if (success) {
        removeProduct(deleteModal.product.id)
        showSuccess('Prodotto eliminato', `"${deleteModal.product.name}" è stato eliminato`)
      } else showError('Errore', 'Impossibile eliminare il prodotto')
    } catch { showError('Errore', 'Si è verificato un errore') }
    finally { setIsDeleting(false); setDeleteModal({ isOpen: false, product: null }) }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({ category: '', subcategory: '', sortBy: 'created_at', sortOrder: 'desc' })
  }

  const hasActiveFilters = searchQuery || filters.category || filters.subcategory

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Prodotti</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{filteredProducts.length} di {products.length} prodotti</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScanner(true)} leftIcon={<Barcode className="w-4 h-4" />}>
            <span className="hidden sm:inline">Scansiona</span>
          </Button>
          <Link href="/products/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Nuovo</span> Prodotto
            </Button>
          </Link>
        </div>
      </div>

      <Card variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cerca prodotto, marca o barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              rightIcon={searchQuery ? <X className="w-4 h-4" /> : undefined}
              onRightIconClick={() => setSearchQuery('')}
            />
          </div>
          <Button variant={showFilters ? 'primary' : 'outline'} onClick={() => setShowFilters(!showFilters)} leftIcon={<SlidersHorizontal className="w-4 h-4" />}>
            Filtri {hasActiveFilters && <span className="ml-1.5 w-2 h-2 rounded-full bg-white" />}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select label="Categoria" value={filters.category || ''} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                options={[{ value: '', label: 'Tutte le categorie' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
              <Select label="Sottocategoria" value={filters.subcategory || ''} onChange={(e) => setFilters(f => ({ ...f, subcategory: e.target.value }))}
                options={[{ value: '', label: 'Tutte' }, ...filteredSubcategories.map(s => ({ value: s.id, label: s.name }))]} disabled={!filters.category} />
              <Select label="Ordina per" value={filters.sortBy || 'created_at'} onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as FilterOptions['sortBy'] }))}
                options={[{ value: 'created_at', label: 'Data' }, { value: 'name', label: 'Nome' }, { value: 'brand', label: 'Marca' }, { value: 'quantity', label: 'Quantità' }, { value: 'price', label: 'Prezzo' }]} />
              <Select label="Direzione" value={filters.sortOrder || 'desc'} onChange={(e) => setFilters(f => ({ ...f, sortOrder: e.target.value as 'asc' | 'desc' }))}
                options={[{ value: 'desc', label: 'Decrescente' }, { value: 'asc', label: 'Crescente' }]} />
            </div>
            {hasActiveFilters && <div className="mt-4 flex justify-end"><Button variant="ghost" size="sm" onClick={clearFilters}>Cancella filtri</Button></div>}
          </div>
        )}
      </Card>

      {filteredProducts.length === 0 ? (hasActiveFilters ? <EmptySearch /> : <EmptyProducts onAdd={() => router.push('/products/new')} />) : (
        <div className="space-y-4">
          <div className="hidden lg:block">
            <Card variant="elevated" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Prodotto</th>
                      <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Categoria</th>
                      <th className="text-center p-4 font-medium text-gray-500 dark:text-gray-400">Quantità</th>
                      <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Prezzo</th>
                      <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <ProductRow key={product.id} product={product} onEdit={() => router.push(`/products/${product.id}/edit`)} onDelete={() => setDeleteModal({ isOpen: true, product })} onView={() => setProductPreview(product)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          <div className="lg:hidden grid gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={() => router.push(`/products/${product.id}/edit`)} onDelete={() => setDeleteModal({ isOpen: true, product })} onView={() => setProductPreview(product)} />
            ))}
          </div>
        </div>
      )}

      <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />

      <Modal isOpen={!!productPreview} onClose={() => setProductPreview(null)} title={productPreview?.name} size="md">
        {productPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Marca</p><p className="font-medium text-gray-900 dark:text-white">{productPreview.brand}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Barcode</p><p className="font-medium text-gray-900 dark:text-white">{productPreview.barcode || '-'}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Quantità</p><p className="font-medium text-gray-900 dark:text-white">{productPreview.quantity}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Prezzo Vendita</p><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(productPreview.sale_price)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Prezzo Acquisto</p><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(productPreview.purchase_price)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Categoria</p><p className="font-medium text-gray-900 dark:text-white">{productPreview.category?.name || '-'}</p></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" className="flex-1" onClick={() => { router.push(`/products/${productPreview.id}/edit`); setProductPreview(null) }} leftIcon={<Edit2 className="w-4 h-4" />}>Modifica</Button>
              <Button variant="outline" onClick={() => setProductPreview(null)}>Chiudi</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, product: null })} onConfirm={handleDelete}
        title="Elimina prodotto" message={`Sei sicuro di voler eliminare "${deleteModal.product?.name}"? Questa azione non può essere annullata.`}
        confirmText="Elimina" variant="danger" isLoading={isDeleting} />
    </div>
  )
}

function ProductRow({ product, onEdit, onDelete, onView }: { product: Product; onEdit: () => void; onDelete: () => void; onView: () => void }) {
  const status = getStockStatus(product.quantity, product.min_quantity)
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
          <div><p className="font-medium text-gray-900 dark:text-white">{product.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p></div>
        </div>
      </td>
      <td className="p-4"><p className="text-gray-900 dark:text-white">{product.category?.name || '-'}</p>{product.subcategory && <p className="text-sm text-gray-500 dark:text-gray-400">{product.subcategory.name}</p>}</td>
      <td className="p-4 text-center"><Badge variant={status === 'ok' ? 'success' : status === 'low' ? 'warning' : 'danger'} size="sm" dot>{product.quantity}</Badge></td>
      <td className="p-4 text-right"><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(product.sale_price)}</p><p className="text-sm text-gray-500 dark:text-gray-400">Acq: {formatCurrency(product.purchase_price)}</p></td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onView} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  )
}

function ProductCard({ product, onEdit, onDelete, onView }: { product: Product; onEdit: () => void; onDelete: () => void; onView: () => void }) {
  const status = getStockStatus(product.quantity, product.min_quantity)
  return (
    <Card variant="elevated" className="card-hover" onClick={onView}>
      <div className="flex items-start gap-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', getStockStatusBg(status))}><Package className={cn('w-6 h-6', getStockStatusColor(status))} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div><h3 className="font-medium text-gray-900 dark:text-white truncate">{product.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p></div>
            <Badge variant={status === 'ok' ? 'success' : status === 'low' ? 'warning' : 'danger'} size="sm">{product.quantity} pz</Badge>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div><p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(product.sale_price)}</p><p className="text-xs text-gray-500 dark:text-gray-400">{product.category?.name}</p></div>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={onEdit} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
