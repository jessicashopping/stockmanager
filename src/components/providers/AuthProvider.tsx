'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore, initializeTheme } from '@/lib/store'
import { validateSession, initializeDefaultUser } from '@/lib/auth'
import { Spinner } from '@/components/ui'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { sessionToken, setUser, isAuthenticated, _hasHydrated } = useStore()
  
  useEffect(() => {
    initializeTheme()
  }, [])
  
  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) {
      return
    }
    
    const checkAuth = async () => {
      try {
        // Initialize default user if needed
        await initializeDefaultUser()
        
        if (sessionToken) {
          const user = await validateSession(sessionToken)
          if (user) {
            setUser(user)
          } else {
            // Invalid session, clear it
            useStore.getState().logout()
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [sessionToken, setUser, _hasHydrated])
  
  useEffect(() => {
    // Wait for both hydration and auth check
    if (!_hasHydrated || isLoading) {
      return
    }
    
    const publicPaths = ['/login']
    const isPublicPath = publicPaths.includes(pathname)
    
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login')
    } else if (isAuthenticated && isPublicPath) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, pathname, router, _hasHydrated])
  
  // Show loading while hydrating or checking auth
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}
