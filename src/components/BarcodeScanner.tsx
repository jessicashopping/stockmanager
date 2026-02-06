'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, Flashlight, SwitchCamera, Barcode, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose?: () => void
  className?: string
}

export function BarcodeScanner({ onScan, onClose, className }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const startScanner = useCallback(async () => {
    if (!containerRef.current || isScanning) return

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      const scannerId = 'barcode-scanner-container'
      
      // Clean up any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          // Ignore
        }
      }
      
      scannerRef.current = new Html5Qrcode(scannerId)

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 150 },
        aspectRatio: 1.5,
      }

      await scannerRef.current.start(
        { facingMode },
        config,
        (decodedText: string) => {
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }
          onScan(decodedText)
          stopScanner()
        },
        () => {}
      )

      setIsScanning(true)
      setError(null)

      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities()
        setHasFlash('torch' in capabilities)
      } catch {
        setHasFlash(false)
      }
    } catch (err: any) {
      console.error('Error starting scanner:', err)
      setError(
        err.message?.includes('Permission')
          ? 'Permesso fotocamera negato. Abilita l\'accesso alla fotocamera.'
          : 'Impossibile avviare la fotocamera.'
      )
      setIsScanning(false)
    }
  }, [facingMode, onScan, isScanning])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
    setFlashOn(false)
  }, [])

  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return
    
    try {
      if (flashOn) {
        await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: false }] })
      } else {
        await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: true }] })
      }
      setFlashOn(!flashOn)
    } catch (err) {
      console.error('Error toggling flash:', err)
    }
  }

  const switchCamera = async () => {
    await stopScanner()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    setTimeout(startScanner, 100)
  }

  const handleClose = () => {
    stopScanner()
    onClose?.()
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  // Auto-start scanner when component mounts
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      setIsInitialized(true)
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, startScanner])

  return (
    <div className={cn('relative', className)}>
      <div className="relative overflow-hidden rounded-xl bg-black">
        <div 
          id="barcode-scanner-container" 
          ref={containerRef}
          className="w-full aspect-[4/3]"
        />
        
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Avvio fotocamera...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={startScanner} variant="primary" leftIcon={<Camera className="w-4 h-4" />}>
                Riprova
              </Button>
            </div>
          </div>
        )}
        
        {isScanning && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/40" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[150px]">
                <div className="absolute inset-0 bg-transparent" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
                
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br" />
                
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-pulse" />
              </div>
            </div>
            
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70"
                leftIcon={<X className="w-4 h-4" />}
              >
                Chiudi
              </Button>
              
              <div className="flex gap-2">
                {hasFlash && (
                  <button
                    onClick={toggleFlash}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <Flashlight className={cn('w-5 h-5', flashOn && 'text-yellow-400')} />
                  </button>
                )}
                <button
                  onClick={switchCamera}
                  className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <SwitchCamera className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm bg-black/50 rounded-lg px-4 py-2">
                Posiziona il codice a barre nell'area evidenziata
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface BarcodeScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-lg mx-4">
        <BarcodeScanner onScan={onScan} onClose={onClose} />
      </div>
    </div>
  )
}
