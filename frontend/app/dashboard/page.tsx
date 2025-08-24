"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { EditInvoiceModal } from "@/components/EditInvoiceModal";
import { apiClient, User, Invoice, Subscription } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [languageKey, setLanguageKey] = useState(i18n.language);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetchDashboardData();
  }, []);
  useEffect(() => {
    console.log("Language changed to:", i18n.language);
    setLanguageKey(i18n.language);
  }, [i18n.language]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch user data
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      try {
        const subscriptionResponse = await apiClient.getCurrentSubscription();
        if (subscriptionResponse.success && subscriptionResponse.data) {
          setSubscription(subscriptionResponse.data);
        }
      } catch (error) {
        console.log("No subscription found");
      }

      const invoicesResponse = await apiClient.getInvoices();
      if (invoicesResponse.success && invoicesResponse.data) {
        setInvoices(invoicesResponse.data);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || t("dashboard.loadError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadInvoice = async () => {
    router.push("/invoices");
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSaveInvoice = async (updatedData: Partial<Invoice>) => {
    if (!editingInvoice) return;

    try {
      setIsEditing(true);
      setMessage(null);

      const response = await apiClient.updateInvoice(editingInvoice.id, {
        vendor: updatedData.vendor || "",
        date: updatedData.date || "",
        amount: updatedData.amount || "",
        taxId: updatedData.taxId || "",
      });

      if (response.success && response.data) {
        setMessage({ type: "success", text: t("dashboard.editSuccess") });

        setInvoices((prev) =>
          prev.map((invoice) =>
            invoice.id === editingInvoice.id ? response.data! : invoice
          )
        );
        handleCloseEditModal();
      } else {
        setMessage({
          type: "error",
          text: response.message || t("dashboard.editError"),
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || t("dashboard.networkError"),
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm(t("dashboard.deleteConfirm"))) return;

    try {
      const response = await apiClient.deleteInvoice(invoiceId);

      if (response.success) {
        setMessage({ type: "success", text: t("dashboard.deleteSuccess") });

        setInvoices((prev) =>
          prev.filter((invoice) => invoice.id !== invoiceId)
        );
      } else {
        setMessage({
          type: "error",
          text: response.message || t("dashboard.deleteError"),
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || t("dashboard.networkError"),
      });
    }
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageDisplayName = (languageCode: string) => {
    const languageMap: { [key: string]: string } = {
      english: "English",
      german: "German",
      arabic: "Arabic",
      en: "English",
      de: "German",
      ar: "Arabic",
    };
    return (
      languageMap[languageCode?.toLowerCase()] || languageCode || "English"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">{t("common.loading")}</p>
          </div>
        </div>

        {/* Edit Invoice Modal */}
        <EditInvoiceModal
          invoice={editingInvoice}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveInvoice}
          isLoading={isEditing}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {t("dashboard.welcomeMessage", { name: user?.name || "User" })}
          </h1>
          <p className="text-primary-100">
            {t("dashboard.currentLanguage", {
              language: getLanguageDisplayName(i18n.language || "english"),
            })}
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {t("dashboard.subscriptionInfo")}
            </h2>
            {subscription?.plan !== "Pro" &&
              subscription?.plan !== "Business" && (
                <button
                  onClick={() => router.push("/settings?tab=subscription")}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {t("dashboard.upgrade")}
                </button>
              )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {t("dashboard.plan")}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.plan || "Free"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {t("dashboard.status")}
              </p>
              <p className="text-lg font-semibold text-primary-600">
                {subscription?.status === "active"
                  ? "Active"
                  : subscription?.status || "Active"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {t("dashboard.uploadLimit")}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.uploadLimit === -1
                  ? "∞"
                  : subscription?.uploadLimit || 5}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                {t("dashboard.uploadsUsed")}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription?.uploadsUsed || 0} /{" "}
                {subscription?.uploadLimit === -1
                  ? "∞"
                  : subscription?.uploadLimit || 5}
              </p>
            </div>
          </div>

          {subscription?.uploadLimit !== -1 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t("dashboard.uploadsRemaining")}</span>
                <span>{subscription?.uploadsRemaining || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((subscription?.uploadsUsed || 0) /
                        (subscription?.uploadLimit || 5)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Next Billing Date */}
          {subscription?.renewDate && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {t("dashboard.nextBilling")}:{" "}
                {formatDate(subscription.renewDate)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {t("dashboard.uploadInvoice")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("dashboard.uploadDescription")}
              </p>
            </div>
            <button
              onClick={handleUploadInvoice}
              disabled={isUploading}
              className="bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("dashboard.uploading")}
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {t("dashboard.uploadInvoice")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {t("dashboard.recentInvoices")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dashboard.vendor")}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dashboard.date")}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dashboard.amount")}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dashboard.taxId")}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("dashboard.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 sm:px-6 py-4 text-center text-gray-500"
                    >
                      {t("dashboard.noInvoices")}
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.vendor}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.taxId}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {t("dashboard.edit")}
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t("dashboard.delete")}
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

      <EditInvoiceModal
        invoice={editingInvoice}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveInvoice}
        isLoading={isEditing}
      />
    </Layout>
  );
}
