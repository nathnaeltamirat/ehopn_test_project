// API service layer for backend integration
const API_BASE_URL = 'https://ehopn-test-project.onrender.com/'

// Types matching backend interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  language: string;
  subscriptionPlan: string;
}

export interface Invoice {
  id: string;
  vendor: string;
  date: string;
  amount: string;
  taxId: string;
  fileUrl?: string;
}

export interface InvoiceUploadResponse {
  vendor: string;
  date: string;
  amount: number;
  taxId: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  description: string;
  uploadLimit: number;
}

export interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'canceled' | 'pending';
  renewDate: string;
  amount: number;
  currency: string;
  features: string[];
  uploadLimit: number;
  uploadsUsed: number;
  uploadsRemaining: number;
  chapaTxRef?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}


class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    language: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/me');
  }

  async forgotPassword(data: { email: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Invoice endpoints
  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    return this.request<ApiResponse<Invoice[]>>('/invoices');
  }

  async uploadInvoice(file: File): Promise<ApiResponse<InvoiceUploadResponse & { fileUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${this.baseURL}/invoices/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createInvoice(data: {
    vendor: string;
    date: string;
    amount: string;
    taxId: string;
    fileUrl?: string;
  }): Promise<ApiResponse<Invoice>> {
    return this.request<ApiResponse<Invoice>>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(
    id: string,
    data: {
      vendor: string;
      date: string;
      amount: string;
      taxId: string;
    }
  ): Promise<ApiResponse<Invoice>> {
    return this.request<ApiResponse<Invoice>>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Subscription endpoints
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return this.request<ApiResponse<SubscriptionPlan[]>>('/subscription/plans');
  }

  async createChapaPayment(planId: string): Promise<ApiResponse<{ checkoutUrl: string; txRef: string }>> {
    return this.request<ApiResponse<{ checkoutUrl: string; txRef: string }>>('/subscription/chapa-payment', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async verifyChapaPayment(txRef: string): Promise<ApiResponse<Subscription>> {
    return this.request<ApiResponse<Subscription>>('/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ txRef }),
    });
  }

  async getCurrentSubscription(): Promise<ApiResponse<Subscription>> {
    return this.request<ApiResponse<Subscription>>('/subscription/me');
  }

  async createSubscription(data: { plan: string }): Promise<ApiResponse<Subscription>> {
    return this.request<ApiResponse<Subscription>>('/subscription/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/subscription/cancel', {
      method: 'POST',
    });
  }

  // User language update
  async updateUserLanguage(language: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/user/language', {
      method: 'PUT',
      body: JSON.stringify({ language }),
    });
  }

  // User profile update
  async updateUserProfile(data: { name: string; email: string }): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User password change
  async changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string; 
  }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User account deletion
  async deleteAccount(password: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/user/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
