'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function AuthCallbackPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (error) {
  
      console.error('OAuth error:', error)
      router.push('/login?error=auth_failed')
      return
    }

    if (success === 'true' && token) {
   
      localStorage.setItem('token', token)
      
      router.push('/dashboard')
    } else {

      router.push('/login?error=no_token')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('auth.processing')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.completingAuth')}
          </p>
        </div>
      </div>
    </div>
  )
}
