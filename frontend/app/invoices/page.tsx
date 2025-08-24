'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { Layout } from '@/components/Layout'
import { EditInvoiceModal } from '@/components/EditInvoiceModal'
import { apiClient, Invoice, InvoiceUploadResponse } from '@/lib/api'

export default function InvoicesPage() {
  const { t } = useTranslation()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [extractedData, setExtractedData] = useState<(InvoiceUploadResponse & { fileUrl: string }) | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editedData, setEditedData] = useState<(InvoiceUploadResponse & { fileUrl: string }) | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getInvoices()
      if (response.success && response.data) {
        setInvoices(response.data)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('invoices.loadError') })
    } finally {
      setIsLoading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    setMessage(null)
    setExtractedData(null)
    setShowEditForm(false)

    try {
      setMessage({ type: 'success', text: t('invoices.processingFile') })
      
      const response = await apiClient.uploadInvoice(acceptedFiles[0])

      if (response.success && response.data) {
        setExtractedData(response.data)
        setEditedData(response.data)
        setShowEditForm(true)
        setMessage({ type: 'success', text: t('invoices.uploadSuccess') })
      } else {
        setMessage({ type: 'error', text: response.message || t('invoices.uploadError') })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: error.message || t('invoices.networkError') })
    } finally {
      setIsUploading(false)
    }
  }, [t])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleEditChange = (field: keyof (InvoiceUploadResponse & { fileUrl: string }), value: string | number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value
      })
    }
  }

  const handleSaveInvoice = async () => {
    if (!editedData) return

    setIsUploading(true)
    setMessage(null)

    try {
      const response = await apiClient.createInvoice({
        vendor: editedData.vendor,
        date: editedData.date,
        amount: editedData.amount.toString(),
        taxId: editedData.taxId,
        fileUrl: editedData.fileUrl,
      })

      if (response.success) {
        setMessage({ type: 'success', text: t('invoices.saveSuccess') })
        setShowEditForm(false)
        setExtractedData(null)
        setEditedData(null)
        // Refresh the invoice list
        fetchInvoices()
      } else {
        setMessage({ type: 'error', text: response.message || t('invoices.saveError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('invoices.networkError') })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setExtractedData(null)
    setEditedData(null)
    setMessage(null)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingInvoice(null)
  }

  const handleSaveEditedInvoice = async (updatedData: Partial<Invoice>) => {
    if (!editingInvoice) return

    try {
      setIsEditing(true)
      setMessage(null)

      const response = await apiClient.updateInvoice(editingInvoice.id, {
        vendor: updatedData.vendor || '',
        date: updatedData.date || '',
        amount: updatedData.amount || '',
        taxId: updatedData.taxId || ''
      })

      if (response.success && response.data) {
        setMessage({ type: 'success', text: t('dashboard.editSuccess') })
        // Update the invoice in the local state
        setInvoices(prev => prev.map(invoice => 
          invoice.id === editingInvoice.id ? response.data! : invoice
        ))
        handleCloseEditModal()
      } else {
        setMessage({ type: 'error', text: response.message || t('dashboard.editError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('dashboard.networkError') })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm(t('dashboard.deleteConfirm'))) return

    try {
      const response = await apiClient.deleteInvoice(invoiceId)

      if (response.success) {
        setMessage({ type: 'success', text: t('dashboard.deleteSuccess') })
        // Remove from local state
        setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId))
      } else {
        setMessage({ type: 'error', text: response.message || t('dashboard.deleteError') })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('dashboard.networkError') })
    }
  }

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('invoices.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your invoices and payments</p>
          </div>
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


        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('invoices.uploadInvoice')}</h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : isDragReject
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-medium text-gray-900">{t('invoices.processing')}</p>
                <p className="text-sm text-gray-500">{t('invoices.extractingData')}</p>
                <div className="text-xs text-gray-400">
                  <p>• Processing file...</p>
                  <p>• Extracting text...</p>
                  <p>• Analyzing with AI...</p>
                  <p>• Preparing results...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive 
                      ? t('invoices.dropHere') 
                      : t('invoices.dragDropOrClick')
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('invoices.supportedFormats')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {showEditForm && editedData && (
          <div className="bg-white shadow text-black rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('invoices.editExtractedData')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('invoices.vendor')}
                </label>
                <input
                  type="text"
                  value={editedData.vendor}
                  onChange={(e) => handleEditChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('invoices.date')}
                </label>
                <input
                  type="date"
                  value={editedData.date}
                  onChange={(e) => handleEditChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('invoices.amount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editedData.amount}
                  onChange={(e) => handleEditChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('invoices.taxId')}
                </label>
                <input
                  type="text"
                  value={editedData.taxId}
                  onChange={(e) => handleEditChange('taxId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveInvoice}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? t('common.loading') : t('invoices.saveInvoice')}
              </button>
            </div>
          </div>
        )}

        {/* Invoice Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('Total Invoices')}</dt>
                    <dd className="text-lg font-medium text-gray-900">{invoices.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('Total Invoice Amount')}</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0).toString())}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('This month Invoice')}</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {invoices.filter(invoice => {
                        const invoiceDate = new Date(invoice.date)
                        const now = new Date()
                        return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear()
                      }).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoices.vendor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoices.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoices.amount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('invoices.taxId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {t('No Invoice - Please Upload Invoice')}
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.vendor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.taxId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            {t('dashboard.edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('dashboard.delete')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        invoice={editingInvoice}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedInvoice}
        isLoading={isEditing}
      />
    </Layout>
  )
}
