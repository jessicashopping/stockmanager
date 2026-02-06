'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Camera, X, Flashlight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose?: () => void
  className?: string
}

export function BarcodeScanner({ onScan, onClose, className }: BarcodeScannerProps) {
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasFlash, setHasFlash] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const initRef = useRef(false)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.log('Stop scanner:', err)
      }
      scannerRef.current = null
    }
  }

  const startScanner = async () => {
    if (!mountedRef.current) return
    
    setStatus('loading')
    setErrorMessage('')

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported')
      }

      // Request camera permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        })
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop())
      } catch (permErr: any) {
        if (permErr.name === 'NotAllowedError') {
          throw new Error('Permesso fotocamera negato. Vai nelle impostazioni del browser e abilita la fotocamera per questo sito.')
        }
        throw new Error('Impossibile accedere alla fotocamera.')
      }

      // Import library
      const { Html5Qrcode } = await import('html5-qrcode')
      
      if (!mountedRef.current) return

      // Clean up any existing instance
      await stopScanner()
      
      // Create new scanner
      scannerRef.current = new Html5Qrcode('barcode-scanner-container', {
        verbose: false
      })

      if (!mountedRef.current) {
        await stopScanner()
        return
      }

      // Start scanning
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
        },
        (decodedText: string) => {
          // Success callback
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }
          stopScanner()
          onScan(decodedText)
        },
        () => {
          // Ignore scan errors (no code found)
        }
      )

      if (!mountedRef.current) {
        await stopScanner()
        return
      }

      setStatus('scanning')

      // Check for flash capability
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities()
        setHasFlash(!!capabilities?.torch)
      } catch {
        setHasFlash(false)
      }

    } catch (err: any) {
      console.error('Scanner error:', err)
      if (mountedRef.current) {
        setStatus('error')
        setErrorMessage(err.message || 'Errore durante l\'avvio della fotocamera')
      }
    }
  }

  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return
    
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !flashOn }]
      })
      setFlashOn(!flashOn)
    } catch (err) {
      console.error('Flash toggle error:', err)
    }
  }

  const handleClose = () => {
    stopScanner()
    onClose?.()
  }

  // Initialize scanner on mount
  useEffect(() => {
    mountedRef.current = true
    
    if (!initRef.current) {
      initRef.current = true
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      return () => clearTimeout(timer)
    }

    return () => {
      mountedRef.current = false
      stopScanner()
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <div className="relative overflow-hidden rounded-xl bg-black min-h-[300px]">
        {/* Scanner container - always present */}
        <div 
          id="barcode-scanner-container" 
          className="w-full aspect-[4/3]"
        />
        
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center text-white">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
              <p className="text-lg">Avvio fotocamera...</p>
              <p className="text-sm text-gray-400 mt-1">Consenti l'accesso se richiesto</p>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-2 font-medium">Errore Fotocamera</p>
              <p className="text-gray-400 text-sm mb-4 max-w-xs">{errorMessage}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={startScanner} variant="primary" size="sm" leftIcon={<Camera className="w-4 h-4" />}>
                  Riprova
                </Button>
                <Button onClick={handleClose} variant="outline" size="sm">
                  Chiudi
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Scanning overlay */}
        {status === 'scanning' && (
          <>
            {/* Scan frame overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[150px]">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                
                {/* Scanning line animation */}
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary-500 animate-pulse" />
              </div>
            </div>
            
            {/* Top controls */}
            <div className="absolute top-3 left-3 right-3 flex justify-between z-20">
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                leftIcon={<X className="w-4 h-4" />}
              >
                Chiudi
              </Button>
              
              {hasFlash && (
                <button
                  onClick={toggleFlash}
                  className={cn(
                    "p-2.5 rounded-lg backdrop-blur-sm transition-colors",
                    flashOn 
                      ? "bg-yellow-500 text-black" 
                      : "bg-black/60 text-white hover:bg-black/80"
                  )}
                >
                  <Flashlight className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Bottom instruction */}
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <p className="text-white text-sm text-center bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2.5">
                📦 Inquadra il codice a barre
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-lg">
        <BarcodeScanner onScan={onScan} onClose={onClose} />
      </div>
    </div>
  )
}
