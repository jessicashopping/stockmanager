'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { login } from '@/lib/auth'
import { Button, Input } from '@/components/ui'
import { ThemeToggleButton } from '@/components/ThemeToggle'
import { showSuccess, showError } from '@/components/ui/Toast'
import { Store, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setSessionToken } = useStore()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password')
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await login(username, password)
      
      if (result) {
        setUser(result.user)
        setSessionToken(result.token)
        showSuccess('Accesso effettuato', `Benvenuto, ${result.user.display_name}!`)
        router.push('/dashboard')
      } else {
        setError('Credenziali non valide')
        showError('Errore di accesso', 'Username o password non corretti')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Errore durante l\'accesso. Riprova.')
      showError('Errore', 'Si è verificato un errore. Riprova.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
              StockManager Pro
            </h1>
            <p className="text-xl text-white/80 max-w-md">
              Gestisci il tuo inventario in modo semplice, veloce e professionale.
            </p>
          </div>
          
          <div className="space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Aggiornamenti in tempo reale</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Scanner barcode integrato</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Funziona su tutti i dispositivi</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - login form */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="flex justify-end p-4">
          <ThemeToggleButton />
        </div>
        
        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                StockManager Pro
              </h1>
            </div>
            
            {/* Login card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bentornato
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Accedi per gestire il tuo inventario
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </p>
                  </div>
                )}
                
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Inserisci username"
                  leftIcon={<User className="w-5 h-5" />}
                  autoComplete="username"
                  disabled={isLoading}
                />
                
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Accedi
                </Button>
              </form>
              
              {/* Demo credentials hint */}
              <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Credenziali demo:</span>
                  <br />
                  Username: <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-primary-600 dark:text-primary-400">Admin</code>
                  <br />
                  Password: <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-primary-600 dark:text-primary-400">Jessica26</code>
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              &copy; {new Date().getFullYear()} StockManager Pro. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
