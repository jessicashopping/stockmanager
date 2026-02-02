'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { createCategory, updateCategory, deleteCategory, createSubcategory, updateSubcategory, deleteSubcategory } from '@/lib/api/categories'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Modal, ConfirmModal, Badge, EmptyCategories } from '@/components/ui'
import { showSuccess, showError } from '@/components/ui/Toast'
import { categoryColors, categoryIcons, getRandomColor, getRandomIcon, cn } from '@/lib/utils'
import type { Category, Subcategory } from '@/lib/types'
import { Plus, Edit2, Trash2, FolderTree, ChevronDown, ChevronRight, Tag, Palette } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export default function CategoriesPage() {
  const { categories, subcategories, products, addCategory, updateCategory: updateLocalCategory, removeCategory, addSubcategory, updateSubcategory: updateLocalSubcategory, removeSubcategory } = useStore()
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; category: Category | null }>({ isOpen: false, category: null })
  const [subcategoryModal, setSubcategoryModal] = useState<{ isOpen: boolean; subcategory: Subcategory | null; categoryId: string | null }>({ isOpen: false, subcategory: null, categoryId: null })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'category' | 'subcategory'; item: Category | Subcategory | null }>({ isOpen: false, type: 'category', item: null })
  
  const [formData, setFormData] = useState({ name: '', description: '', color: getRandomColor(), icon: 'package' })
  const [subFormData, setSubFormData] = useState({ name: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getCategorySubcategories = (categoryId: string) => subcategories.filter(s => s.category_id === categoryId)
  const getCategoryProductCount = (categoryId: string) => products.filter(p => p.category_id === categoryId).length
  const getSubcategoryProductCount = (subcategoryId: string) => products.filter(p => p.subcategory_id === subcategoryId).length

  // Category handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setFormData({ name: category.name, description: category.description || '', color: category.color, icon: category.icon })
    } else {
      setFormData({ name: '', description: '', color: getRandomColor(), icon: 'package' })
    }
    setCategoryModal({ isOpen: true, category: category || null })
  }

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) { showError('Errore', 'Il nome è obbligatorio'); return }
    setIsLoading(true)
    try {
      if (categoryModal.category) {
        const updated = await updateCategory(categoryModal.category.id, formData)
        if (updated) { updateLocalCategory(updated); showSuccess('Categoria aggiornata') }
      } else {
        const created = await createCategory(formData)
        if (created) { addCategory(created); showSuccess('Categoria creata') }
      }
      setCategoryModal({ isOpen: false, category: null })
    } catch { showError('Errore', 'Operazione fallita') }
    finally { setIsLoading(false) }
  }

  // Subcategory handlers
  const openSubcategoryModal = (categoryId: string, subcategory?: Subcategory) => {
    if (subcategory) {
      setSubFormData({ name: subcategory.name, description: subcategory.description || '' })
    } else {
      setSubFormData({ name: '', description: '' })
    }
    setSubcategoryModal({ isOpen: true, subcategory: subcategory || null, categoryId })
  }

  const handleSaveSubcategory = async () => {
    if (!subFormData.name.trim() || !subcategoryModal.categoryId) { showError('Errore', 'Il nome è obbligatorio'); return }
    setIsLoading(true)
    try {
      if (subcategoryModal.subcategory) {
        const updated = await updateSubcategory(subcategoryModal.subcategory.id, subFormData)
        if (updated) { updateLocalSubcategory(updated); showSuccess('Sottocategoria aggiornata') }
      } else {
        const created = await createSubcategory({ ...subFormData, category_id: subcategoryModal.categoryId })
        if (created) { addSubcategory(created); showSuccess('Sottocategoria creata') }
      }
      setSubcategoryModal({ isOpen: false, subcategory: null, categoryId: null })
    } catch { showError('Errore', 'Operazione fallita') }
    finally { setIsLoading(false) }
  }

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteModal.item) return
    setIsLoading(true)
    try {
      if (deleteModal.type === 'category') {
        const success = await deleteCategory(deleteModal.item.id)
        if (success) { removeCategory(deleteModal.item.id); showSuccess('Categoria eliminata') }
        else showError('Errore', 'Impossibile eliminare: ci sono prodotti associati')
      } else {
        const success = await deleteSubcategory(deleteModal.item.id)
        if (success) { removeSubcategory(deleteModal.item.id); showSuccess('Sottocategoria eliminata') }
        else showError('Errore', 'Impossibile eliminare: ci sono prodotti associati')
      }
      setDeleteModal({ isOpen: false, type: 'category', item: null })
    } catch { showError('Errore', 'Operazione fallita') }
    finally { setIsLoading(false) }
  }

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || LucideIcons.Package
    return Icon
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Categorie</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{categories.length} categorie, {subcategories.length} sottocategorie</p>
        </div>
        <Button variant="primary" onClick={() => openCategoryModal()} leftIcon={<Plus className="w-4 h-4" />}>
          Nuova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyCategories onAdd={() => openCategoryModal()} />
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            const subs = getCategorySubcategories(category.id)
            const productCount = getCategoryProductCount(category.id)
            const IconComponent = getIcon(category.icon)

            return (
              <Card key={category.id} variant="elevated" padding="none">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleCategory(category.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </button>
                    
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                      <IconComponent className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <Badge variant="default" size="sm">{productCount} prodotti</Badge>
                      </div>
                      {category.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{category.description}</p>}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openSubcategoryModal(category.id)} leftIcon={<Plus className="w-4 h-4" />}>
                        <span className="hidden sm:inline">Sottocategoria</span>
                      </Button>
                      <button onClick={() => openCategoryModal(category)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, type: 'category', item: category })} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && subs.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <div className="w-5" />
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">{sub.name}</p>
                          {sub.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{sub.description}</p>}
                        </div>
                        <Badge variant="default" size="sm">{getSubcategoryProductCount(sub.id)}</Badge>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openSubcategoryModal(category.id, sub)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteModal({ isOpen: true, type: 'subcategory', item: sub })} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && subs.length === 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Nessuna sottocategoria</p>
                    <Button variant="ghost" size="sm" onClick={() => openSubcategoryModal(category.id)} className="mt-2" leftIcon={<Plus className="w-4 h-4" />}>
                      Aggiungi sottocategoria
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Category Modal */}
      <Modal isOpen={categoryModal.isOpen} onClose={() => setCategoryModal({ isOpen: false, category: null })}
        title={categoryModal.category ? 'Modifica Categoria' : 'Nuova Categoria'} size="md">
        <div className="space-y-4">
          <Input label="Nome categoria" value={formData.name} onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="es. Reparto Detersivi" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrizione</label>
            <textarea value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Colore</label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((color) => (
                <button key={color} onClick={() => setFormData(f => ({ ...f, color }))}
                  className={cn('w-8 h-8 rounded-lg transition-transform', formData.color === color && 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110')}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setCategoryModal({ isOpen: false, category: null })}>Annulla</Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveCategory} isLoading={isLoading}>Salva</Button>
          </div>
        </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal isOpen={subcategoryModal.isOpen} onClose={() => setSubcategoryModal({ isOpen: false, subcategory: null, categoryId: null })}
        title={subcategoryModal.subcategory ? 'Modifica Sottocategoria' : 'Nuova Sottocategoria'} size="sm">
        <div className="space-y-4">
          <Input label="Nome sottocategoria" value={subFormData.name} onChange={(e) => setSubFormData(f => ({ ...f, name: e.target.value }))} placeholder="es. Shampoo" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrizione</label>
            <textarea value={subFormData.description} onChange={(e) => setSubFormData(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 px-4 py-2.5" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setSubcategoryModal({ isOpen: false, subcategory: null, categoryId: null })}>Annulla</Button>
            <Button variant="primary" className="flex-1" onClick={handleSaveSubcategory} isLoading={isLoading}>Salva</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, type: 'category', item: null })} onConfirm={handleDelete}
        title={`Elimina ${deleteModal.type === 'category' ? 'categoria' : 'sottocategoria'}`}
        message={`Sei sicuro di voler eliminare "${(deleteModal.item as any)?.name}"? I prodotti associati dovranno essere riassegnati.`}
        confirmText="Elimina" variant="danger" isLoading={isLoading} />
    </div>
  )
}
