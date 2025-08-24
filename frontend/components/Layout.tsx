'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userLanguage, setUserLanguage] = useState<string>('en')

  // Load user's saved language on component mount
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const response = await apiClient.getCurrentUser()
        if (response.success && response.data) {
          const language = response.data.language
          setUserLanguage(language)
          // Update i18n to match user's saved language
          if (i18n.language !== language) {
            i18n.changeLanguage(language)
            document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
          }
        }
      } catch (error) {
        console.log('Could not load user language, using default')
      }
    }

    loadUserLanguage()
  }, [i18n])
const handleUpgrade = ()=>{
  router.push('/settings?tab=subscription')
}
  const changeLanguage = async (lng: string) => {
    try {
      console.log('Changing language to:', lng)
  
      i18n.changeLanguage(lng)
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
      setUserLanguage(lng)

      await apiClient.updateUserLanguage(lng)
      console.log('Language changed successfully')
    } catch (error) {
      console.error('Failed to update language:', error)
      i18n.changeLanguage(userLanguage)
      document.documentElement.dir = userLanguage === 'ar' ? 'rtl' : 'ltr'
    }
  }

  const handleLogout = () => {
  
    router.push('/login')
  }


  const navigation = [
    { name: t('common.dashboard'), href: '/dashboard' },
    { name: t('common.invoices'), href: '/invoices' },
    { name: t('common.settings'), href: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">EHopN</h1>
              </Link>
              
      
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>


            <div className="hidden md:flex items-center space-x-4">
  
              <div className="relative">
                <select
                  value={userLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-white border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">{t('common.english')}</option>
                  <option value="de">{t('common.german')}</option>
                  <option value="ar">{t('common.arabic')}</option>
                </select>
              </div>

       
              <button onClick={handleUpgrade} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
                {t('common.upgrade')}
              </button>

 
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>


            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-900 p-2 rounded-md"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t bg-white">
                {/* Navigation Links */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Language Switcher */}
                <div className="px-3 py-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.language')}
                  </label>
                  <select
                    value={userLanguage}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full bg-white border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="en">{t('common.english')}</option>
                    <option value="de">{t('common.german')}</option>
                    <option value="ar">{t('common.arabic')}</option>
                  </select>
                </div>

                {/* Mobile Upgrade Button */}
                <div className="px-3 py-2">
                  <button 
                    onClick={() => {
                      handleUpgrade()
                      setIsMenuOpen(false)
                    }} 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    {t('common.upgrade')}
                  </button>
                </div>

                {/* Mobile Logout Button */}
                <div className="px-3 py-2">
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
