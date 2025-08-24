'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setMessage({ type: 'error', text: t('auth.invalidResetToken') })
      return
    }
    setToken(tokenParam)
  }, [searchParams, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setMessage({ type: 'error', text: t('auth.invalidResetToken') })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t('auth.passwordsDoNotMatch') })
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: t('auth.passwordTooShort') })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await apiClient.resetPassword({
        token,
        password: formData.password,
      })

      if (response.success) {
        setMessage({ type: 'success', text: t('auth.resetPasswordSuccess') })
        // Clear form
        setFormData({ password: '', confirmPassword: '' })
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: response.message || t('auth.resetPasswordError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('auth.networkError') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {t('auth.invalidResetLink')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.invalidResetToken')}
            </p>
            <div className="mt-4">
              <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.requestNewResetLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.resetPasswordTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.resetPasswordDescription')}
          </p>
        </div>
        
        {/* Success/Error Messages */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('auth.newPassword')}
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.newPasswordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {t('auth.confirmNewPassword')}
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? t('common.loading') : t('auth.resetPassword')}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.rememberPassword')}{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                {t('auth.backToLogin')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
