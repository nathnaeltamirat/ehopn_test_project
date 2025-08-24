'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '@/components/Layout'
import { apiClient, User, Subscription, SubscriptionPlan } from '@/lib/api'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<{
    profile: boolean;
    subscription: boolean;
    language: boolean;
    password: boolean;
    deleteAccount: boolean;
  }>({
    profile: false,
    subscription: false,
    language: false,
    password: false,
    deleteAccount: false
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [deleteAccountData, setDeleteAccountData] = useState({
    password: ''
  })

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({})

  const [deleteAccountErrors, setDeleteAccountErrors] = useState<{
    password?: string;
  }>({})

  useEffect(() => {
    fetchUserData()
    fetchSubscriptionPlans()
  }, [])

  // Check for Chapa success/cancel in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const canceled = urlParams.get('canceled')
    const txRef = urlParams.get('tx_ref')

    if (success && txRef) {
      handleChapaSuccess(txRef)
    } else if (canceled) {
      setMessage({ type: 'error', text: 'Subscription was canceled' })
    }
  }, [])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const [userResponse, subscriptionResponse] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getCurrentSubscription()
      ])
      
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data)
        setProfileData({
          firstName: userResponse.data.name.split(' ')[0] || '',
          lastName: userResponse.data.name.split(' ').slice(1).join(' ') || '',
          email: userResponse.data.email
        })
      }
      
      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscription(subscriptionResponse.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch user data:', error)
      setMessage({ type: 'error', text: error.message || t('settings.loadError') })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await apiClient.getSubscriptionPlans()
      if (response.success && response.data) {
        setSubscriptionPlans(response.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch subscription plans:', error)
    }
  }

  const handleChapaSuccess = async (txRef: string) => {
    try {
      setIsLoading(true)
      setMessage(null)

      const response = await apiClient.verifyChapaPayment(txRef)
      
      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Subscription activated successfully!' })
        setSubscription(response.data)

        fetchUserData()

        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to activate subscription' })
      }
    } catch (error: any) {
      console.error('Failed to handle Chapa success:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to activate subscription' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, subscription: true }))
      setMessage(null)

      const response = await apiClient.createChapaPayment(planId)
      
      if (response.success && response.data) {
 
        if ('checkoutUrl' in response.data) {
          window.open(response.data.checkoutUrl)
          // setMessage({ 
          //   type: 'success', 
          //   text: 'Payment page opened in new tab. Please complete the payment and return here. You can refresh this page after payment to check your subscription status.' 
          // })
        } else {
    
          setMessage({ type: 'success', text: 'Subscription activated successfully!' })
          setSubscription(response.data as any)
          fetchUserData()
        }
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create subscription' })
      }
    } catch (error: any) {
      console.error('Failed to create subscription:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to create subscription' })
    } finally {
      setLoadingStates(prev => ({ ...prev, subscription: false }))
    }
  }

  const handleLanguageChange = async (language: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, language: true }))
      setMessage(null)

      await i18n.changeLanguage(language)
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
      const response = await apiClient.updateUserLanguage(language)

      if (response.success) {
        setMessage({ type: 'success', text: t('settings.languageUpdated') })
        if (user) {
          setUser({ ...user, language })
        }
 
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: response.message || t('settings.languageUpdateError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.networkError') })
    } finally {
      setLoadingStates(prev => ({ ...prev, language: false }))
    }
  }

  const handleVerifyPayment = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, subscription: true }))
      setMessage(null)

      if (!subscription?.chapaTxRef) {
        setMessage({ type: 'error', text: 'No transaction reference found. Please try subscribing again.' })
        return
      }

      const response = await apiClient.verifyChapaPayment(subscription.chapaTxRef)

      if (response.success) {
        setMessage({ type: 'success', text: 'Payment verified successfully! Subscription activated.' })

        fetchUserData()
      } else {
        setMessage({ type: 'error', text: response.message || 'Payment verification failed' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.networkError') })
    } finally {
      setLoadingStates(prev => ({ ...prev, subscription: false }))
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, subscription: true }))
      setMessage(null)

      const response = await apiClient.cancelSubscription()

      if (response.success) {
        setMessage({ type: 'success', text: t('settings.cancelSuccess') })
        setShowCancelConfirm(false)
  
        fetchUserData()
      } else {
        setMessage({ type: 'error', text: response.message || t('settings.cancelError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.networkError') })
    } finally {
      setLoadingStates(prev => ({ ...prev, subscription: false }))
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoadingStates(prev => ({ ...prev, profile: true }))
      setMessage(null)

    
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()

      const response = await apiClient.updateUserProfile({
        name: fullName,
        email: profileData.email
      })

      if (response.success && response.data) {
        setMessage({ type: 'success', text: t('settings.profileUpdated') })
        setUser(response.data)
        
        // Update profile data to match the response
        const nameParts = response.data.name.split(' ')
        setProfileData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: response.data.email
        }))
      } else {
        setMessage({ type: 'error', text: response.message || t('settings.profileUpdateError') })
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      setMessage({ type: 'error', text: error.message || t('settings.networkError') })
    } finally {
      setLoadingStates(prev => ({ ...prev, profile: false }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    

    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validatePasswordForm = () => {
    const errors: typeof passwordErrors = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }

    try {
      setLoadingStates(prev => ({ ...prev, password: true }))
      setMessage(null)

      const response = await apiClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      })

      if (response.success) {
        setMessage({ type: 'success', text: t('settings.passwordChanged') })
        // Clear the form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setPasswordErrors({})
      } else {
        setMessage({ type: 'error', text: response.message || t('settings.passwordChangeError') })
      }
    } catch (error: any) {
      console.error('Password change error:', error)
      setMessage({ type: 'error', text: error.message || t('settings.networkError') })
    } finally {
      setLoadingStates(prev => ({ ...prev, password: false }))
    }
  }

  const handleDeleteAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeleteAccountData(prev => ({ ...prev, [name]: value }));
    setDeleteAccountErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateDeleteAccountForm = () => {
    let errors: typeof deleteAccountErrors = {};
    if (!deleteAccountData.password) errors.password = 'Password is required to delete account';
    setDeleteAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDeleteAccountForm()) return;

    try {
      setLoadingStates(prev => ({ ...prev, deleteAccount: true }));
      setMessage(null);

      const response = await apiClient.deleteAccount(deleteAccountData.password);

      if (response.success) {
        setMessage({ type: 'success', text: t('settings.deleteAccountSuccess') });
        // Clear auth token and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: response.message || t('settings.deleteAccountError') });
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      setMessage({ type: 'error', text: error.message || t('settings.networkError') });
    } finally {
      setLoadingStates(prev => ({ ...prev, deleteAccount: false }));
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const tabs = [
    { id: 'profile', name: t('settings.profile'), icon: '👤' },
    { id: 'subscription', name: t('settings.subscription'), icon: '💳' },
    { id: 'language', name: t('settings.language'), icon: '🌐' },
    { id: 'account', name: t('settings.account'), icon: '🔐' },
    { id: 'notifications', name: t('settings.notifications'), icon: '🔔' },
    { id: 'security', name: t('settings.security'), icon: '🛡️' },
    { id: 'billing', name: t('settings.billing'), icon: '💰' },
    { id: 'preferences', name: t('settings.preferences'), icon: '⚙️' }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.profile')}</h3>
        <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
      </div>
      
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              {t('auth.firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              {t('auth.lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('auth.email')}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loadingStates.profile}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loadingStates.profile ? t('common.loading') : t('settings.updateProfile')}
          </button>
        </div>
      </form>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.subscription')}</h3>
        <p className="mt-1 text-sm text-gray-500">Choose the perfect plan for your needs</p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">Current Plan: {subscription.plan}</h4>
              <p className="text-sm text-blue-700">
                {subscription.plan === 'Free' 
                  ? 'Free plan' 
                  : `${formatCurrency(subscription.amount || 0, subscription.currency || 'usd')} / month`
                }
              </p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : subscription.status === 'canceled'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {t(`settings.status.${subscription.status}`)}
            </span>
          </div>
          {subscription.plan !== 'Free' && (
            <div className="mt-2 text-sm text-blue-700">
              Next billing: {formatDate(subscription.renewDate)}
            </div>
          )}
        </div>
      )}

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.name
          const isPopular = plan.name === 'Pro'
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg border-2 ${
                isCurrentPlan 
                  ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
                  : isPopular
                  ? 'border-blue-500'
                  : 'border-gray-200'
              } overflow-hidden`}
            >
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-1 text-xs font-medium">
                  Most Popular
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg">
                  Current Plan
                </div>
              )}

              <div className="p-4 sm:p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price / 100, plan.currency)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">/month</span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={loadingStates.subscription}
                      className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                    >
                      {loadingStates.subscription ? t('common.loading') : plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>


      {subscription && subscription.status === 'pending' && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Your subscription is pending payment confirmation. Click below to verify payment with Chapa.
            </p>
            <button
              onClick={handleVerifyPayment}
              disabled={loadingStates.subscription}
              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loadingStates.subscription ? t('common.loading') : 'Verify Payment'}
            </button>
          </div>
        </div>
      )}


      {subscription && subscription.plan !== 'Free' && subscription.status === 'active' && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={loadingStates.subscription}
              className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loadingStates.subscription ? t('common.loading') : t('settings.cancelSubscription')}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.language')}</h3>
        <p className="mt-1 text-sm text-gray-500">Choose your preferred language</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {[
            { code: 'en', name: t('common.english'), flag: '🇺🇸' },
            { code: 'de', name: t('common.german'), flag: '🇩🇪' },
            { code: 'ar', name: t('common.arabic'), flag: '🇸🇦' }
          ].map((language) => (
            <div
              key={language.code}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                user?.language === language.code
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <p className="font-medium text-gray-900">{language.name}</p>
                  <p className="text-sm text-gray-500">
                    {language.code === 'ar' ? 'Right-to-left' : 'Left-to-right'}
                  </p>
                </div>
              </div>
              {user?.language === language.code && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.account')}</h3>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">{t('settings.changePassword')}</h4>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                {t('settings.currentPassword')}
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  passwordErrors.currentPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                {t('settings.newPassword')}
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  passwordErrors.newPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('settings.confirmNewPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  passwordErrors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={loadingStates.password}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loadingStates.password ? t('common.loading') : t('settings.changePassword')}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 text-red-600">{t('settings.deleteAccount')}</h4>
          <p className="text-sm text-gray-500 mb-4">{t('settings.deleteAccountWarning')}</p>
          <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
            <div>
              <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700">
                {t('settings.currentPassword')}
              </label>
              <input
                type="password"
                id="deletePassword"
                name="password"
                value={deleteAccountData.password}
                onChange={handleDeleteAccountChange}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                  deleteAccountErrors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
              {deleteAccountErrors.password && (
                <p className="mt-1 text-sm text-red-600">{deleteAccountErrors.password}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={loadingStates.deleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loadingStates.deleteAccount ? t('common.loading') : t('settings.confirmDeleteAccount')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'subscription':
        return renderSubscriptionTab()
      case 'language':
        return renderLanguageTab()
      case 'account':
        return renderAccountTab()
      default:
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{tabs.find(tab => tab.id === activeTab)?.icon}</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tabs.find(tab => tab.id === activeTab)?.name}
            </h3>
            <p className="text-sm text-gray-500">This feature is coming soon.</p>
          </div>
        )
    }
  }

  if (isLoading && !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
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

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-4 sm:px-6" aria-label="Tabs">
              <div className="flex space-x-4 sm:space-x-8 min-w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-1 sm:mr-2">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Cancel Subscription Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  {t('settings.cancelSubscriptionTitle')}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    {t('settings.cancelSubscriptionMessage')}
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loadingStates.subscription}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loadingStates.subscription ? t('common.loading') : t('settings.confirmCancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
