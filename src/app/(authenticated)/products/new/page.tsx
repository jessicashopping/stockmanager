'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { createProduct, lookupBarcode } from '@/lib/api/products'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { BarcodeScanner } from '@/components/BarcodeScanner'
import { showSuccess, showError, showLoading, dismissToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { ArrowLeft, Save, Barcode, Loader2, Sparkles, Package } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { categories, subcategories, addProduct } = useStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    barcode: searchParams.get('barcode') || '',
    quantity: '0',
    min_quantity: '5',
    purchase_price: '',
    sale_price: '',
    category_id: '',
    subcategory_id: '',
    description: '',
  })

  // Auto lookup barcode from URL params
  useEffect(() => {
    const barcode = searchParams.get('barcode')
    if (barcode) {
      handleBarcodeLookup(barcode)
    }
  }, [searchParams])

  const filteredSubcategories = formData.category_id
    ? subcategories.filter(s => s.category_id === formData.category_id)
    : []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleBarcodeScan = (barcode: string) => {
    setShowScanner(false)
    setFormData(prev => ({ ...prev, barcode }))
    handleBarcodeLookup(barcode)
  }

  const handleBarcodeLookup = async (barcode: string) => {
    if (!barcode) return
    
    setIsLookingUp(true)
    try {
      const info = await lookupBarcode(barcode)
      if (info) {
        setFormData(prev => ({
          ...prev,
          barcode,
          name: info.name || prev.name,
          brand: info.brand || prev.brand,
          description: info.description || prev.description,
        }))
        showSuccess('Prodotto trovato!', 'I dati sono stati compilati automaticamente')
      } else {
        showError('Non trovato', 'Nessuna informazione trovata per questo barcode')
      }
    } catch (error) {
      console.error('Barcode lookup error:', error)
    } finally {
      setIsLookingUp(false)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Il nome è obbligatorio'
    if (!formData.brand.trim()) newErrors.brand = 'La marca è obbligatoria'
    if (!formData.category_id) newErrors.category_id = 'Seleziona una categoria'
    if (!formData.purchase_price || parseFloat(formData.purchase_price) < 0) 
      newErrors.purchase_price = 'Inserisci un prezzo valido'
    if (!formData.sale_price || parseFloat(formData.sale_price) < 0) 
      newErrors.sale_price = 'Inserisci un prezzo valido'
    if (parseInt(formData.quantity) < 0) 
      newErrors.quantity = 'La quantità non può essere negativa'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const toastId = showLoading('Salvataggio in corso...')

    try {
      const product = await createProduct({
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        barcode: formData.barcode.trim() || undefined,
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 5,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || undefined,
        description: formData.description.trim() || undefined,
      })

      dismissToast(toastId)

      if (product) {
        // Don't call addProduct here - realtime subscription will handle it
        showSuccess('Prodotto creato!', `"${product.name}" è stato aggiunto all'inventario`)
        router.push('/products')
      } else {
        showError('Errore', 'Impossibile creare il prodotto')
      }
    } catch (error) {
      dismissToast(toastId)
      showError('Errore', 'Si è verificato un errore')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nuovo Prodotto
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Aggiungi un prodotto al tuo inventario
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Barcode Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Scansiona o inserisci manualmente">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-primary-500" />
                Codice a Barre
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showScanner ? (
              <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Inserisci o scansiona il barcode"
                      rightIcon={isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowScanner(true)} leftIcon={<Barcode className="w-4 h-4" />}>
                    Scansiona
                  </Button>
                </div>
                
                {formData.barcode && !isLookingUp && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleBarcodeLookup(formData.barcode)}
                    leftIcon={<Sparkles className="w-4 h-4" />}>
                    Cerca informazioni prodotto
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Informazioni principali">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                Dettagli Prodotto
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Nome prodotto" name="name" value={formData.name} onChange={handleChange} placeholder="es. Shampoo Delicato" error={errors.name} required />
              <Input label="Marca" name="brand" value={formData.brand} onChange={handleChange} placeholder="es. BioNatura" error={errors.brand} required />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Categoria" name="category_id" value={formData.category_id} onChange={handleChange} error={errors.category_id} required
                placeholder="Seleziona categoria"
                options={categories.map(c => ({ value: c.id, label: c.name }))} />
              <Select label="Sottocategoria" name="subcategory_id" value={formData.subcategory_id} onChange={handleChange}
                placeholder="Seleziona sottocategoria" disabled={!formData.category_id}
                options={filteredSubcategories.map(s => ({ value: s.id, label: s.name }))} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrizione</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                placeholder="Descrizione opzionale del prodotto..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900
                  text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 px-4 py-2.5" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Quantity */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle subtitle="Gestione stock e prezzi">Quantità e Prezzi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Quantità" name="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} error={errors.quantity} />
              <Input label="Quantità minima" name="min_quantity" type="number" min="0" value={formData.min_quantity} onChange={handleChange}
                hint="Avviso sotto questa soglia" />
              <Input label="Prezzo acquisto (€)" name="purchase_price" type="number" min="0" step="0.01" value={formData.purchase_price}
                onChange={handleChange} placeholder="0.00" error={errors.purchase_price} required />
              <Input label="Prezzo vendita (€)" name="sale_price" type="number" min="0" step="0.01" value={formData.sale_price}
                onChange={handleChange} placeholder="0.00" error={errors.sale_price} required />
            </div>
            
            {formData.purchase_price && formData.sale_price && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <span className="font-medium">Margine:</span>{' '}
                  €{(parseFloat(formData.sale_price) - parseFloat(formData.purchase_price)).toFixed(2)}{' '}
                  ({((parseFloat(formData.sale_price) - parseFloat(formData.purchase_price)) / parseFloat(formData.purchase_price) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
            Salva Prodotto
          </Button>
        </div>
      </form>
    </div>
  )
}
