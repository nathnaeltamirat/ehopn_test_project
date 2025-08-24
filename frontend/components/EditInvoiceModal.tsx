'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Invoice } from '@/lib/api'

interface EditInvoiceModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedInvoice: Partial<Invoice>) => Promise<void>
  isLoading?: boolean
}

export function EditInvoiceModal({ invoice, isOpen, onClose, onSave, isLoading = false }: EditInvoiceModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<Invoice>>({
    vendor: '',
    date: '',
    amount: '',
    taxId: ''
  })

  useEffect(() => {
    if (invoice) {
      setFormData({
        vendor: invoice.vendor,
        date: invoice.date,
        amount: invoice.amount,
        taxId: invoice.taxId
      })
    }
  }, [invoice])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg shadow-xl max-w-md w-full mx-4">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('dashboard.editInvoice')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.vendor')}
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>

      
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.date')}
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>

   
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.amount')}
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.taxId')}
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </>
              ) : (
                t('common.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
