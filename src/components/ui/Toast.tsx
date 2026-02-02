'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl shadow-lg',
          title: 'font-medium',
          description: 'text-sm',
        },
      }}
    />
  )
}

export { toast }

// Helper functions for common toasts
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description })
}

export const showError = (message: string, description?: string) => {
  toast.error(message, { description })
}

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, { description })
}

export const showInfo = (message: string, description?: string) => {
  toast.info(message, { description })
}

export const showLoading = (message: string) => {
  return toast.loading(message)
}

export const dismissToast = (id: string | number) => {
  toast.dismiss(id)
}
