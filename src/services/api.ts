/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import * as FileSystem from 'expo-file-system/legacy';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Only treat 2xx as success
      validateStatus: (status) => status >= 200 && status < 300,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log('📡 Request URL:', (config.baseURL || '') + (config.url || ''));
        console.log('📡 Request Method:', config.method);
        console.log('📡 Request Data:', config.data);
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('📡 Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
        return response;
      },
      async (error: AxiosError) => {
        console.error('❌ Response Error:', error.message);
        console.error('❌ Error Status:', error.response?.status);
        console.error('❌ Error Data:', error.response?.data);
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(phoneNumber: string, password: string) {
    console.log('📡 API: Making login request to:', API_BASE_URL + API_ENDPOINTS.LOGIN);
    console.log('📡 API: Phone number:', phoneNumber);
    try {
      const response = await this.api.post(API_ENDPOINTS.LOGIN, {
        phone: phoneNumber,
        password,
      });
      console.log('📡 API: Login response status:', response.status);
      console.log('📡 API: Login response data:', response.data);

      // Check if login was successful
      if (!response.data.token) {
        throw new Error('Login failed: No token received');
      }

      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      console.log('📡 API: Token saved to AsyncStorage');
      return response.data;
    } catch (error: any) {
      console.error('📡 API: Login request failed');
      console.error('📡 API: Error:', error.message);
      console.error('📡 API: Error response:', error.response?.data);
      console.error('📡 API: Error status:', error.response?.status);

      // Throw a user-friendly error message
      if (error.response?.status === 404) {
        throw new Error('Invalid phone number or password');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(name: string, phoneNumber: string, password: string) {
    const response = await this.api.post(API_ENDPOINTS.REGISTER, {
      name: name,
      phone: phoneNumber,
      password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    await this.api.post(API_ENDPOINTS.LOGOUT);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Helper method to get auth token
  async getToken() {
    return await AsyncStorage.getItem('authToken');
  }

  // Dashboard
  async getDashboard() {
    try {
      const response = await this.api.get(API_ENDPOINTS.DASHBOARD);
      console.log('� Dashboard loaded successfully');
      console.log('📊 Total Balance:', response.data.totalBalance || 0);
      console.log('📊 Businesses:', response.data.businesses?.length || 0);
      console.log('📊 Transactions:', response.data.transactions?.length || 0);
      if (response.data.businesses?.length > 0) {
        console.log('📊 Sample business:', response.data.businesses[0].business_name);
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Dashboard request failed:', error.message);
      console.error('❌ Dashboard error response:', error.response?.data);
      throw error;
    }
  }

  // Products
  async getPublicProducts(search?: string) {
    try {
      const params = search ? { search } : {};
      const response = await this.api.get('/api/products/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public products:', error);
      return { products: [] };
    }
  }

  // Offers
  async getOffers() {
    try {
      const response = await this.api.get('/api/offers');
      const offersData = response.data.offers || response.data || [];
      console.log('📋 Offers loaded:', offersData.length);
      if (offersData.length > 0) {
        console.log('🔍 Sample offer:', offersData[0].title);
        console.log('🔍 Offer business:', offersData[0].business_name);
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching offers:', error.response?.data || error.message);
      // If endpoint doesn't exist, return empty array instead of crashing
      if (error.response?.status === 404) {
        console.log('⚠️ Offers endpoint not available - returning empty array');
        return { offers: [] };
      }
      throw error;
    }
  }

  // My Businesses (For Customers)
  async getMyBusinesses() {
    try {
      const response = await this.api.get('/api/businesses');
      const businessesData = response.data.businesses || response.data || [];
      console.log('📋 Businesses loaded:', businessesData.length);
      if (businessesData.length > 0) {
        console.log('🔍 Sample business:', businessesData[0].business_name);
        console.log('🔍 Sample balance:', businessesData[0].balance || 0);
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching my businesses:', error.response?.data || error.message);
      // If endpoint doesn't exist, return empty array instead of crashing
      if (error.response?.status === 404) {
        console.log('⚠️ Businesses endpoint not available - returning empty array');
        return { businesses: [] };
      }
      throw error;
    }
  }

  // Business Details (For Customers)
  async getBusinessDetails(businessId: string) {
    try {
      const response = await this.api.get(`/api/business/${businessId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business details:', error);
      throw error;
    }
  }

  async connectBusiness(accessPin: string) {
    try {
      const response = await this.api.post('/api/business/connect', {
        access_pin: accessPin,
      });
      return response.data;
    } catch (error) {
      console.error('Error connecting business:', error);
      throw error;
    }
  }

  async getBusinessProfile(businessId: string) {
    try {
      const response = await this.api.get(`/api/business/${businessId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business profile:', error);
      throw error;
    }
  }

  // Customers
  async getCustomers() {
    const response = await this.api.get(API_ENDPOINTS.CUSTOMERS);
    const customersData = response.data.customers || response.data || [];
    console.log('📋 Customers loaded:', customersData.length);
    if (customersData.length > 0) {
      console.log('🔍 Sample customer:', customersData[0].name);
      console.log('🔍 Sample customer balance:', customersData[0].balance);
    }
    return response.data;
  }

  async getCustomerDetails(customerId: string) {
    const response = await this.api.get(`${API_ENDPOINTS.CUSTOMER_DETAILS}/${customerId}`);
    return response.data;
  }

  async addCustomer(data: {
    name: string;
    phone_number: string;
    address?: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_CUSTOMER, data);
    return response.data;
  }

  // Note: Backend doesn't support customer update/delete operations
  // Customers can only be created (POST /api/customer)
  // To "delete", would need backend endpoint implementation

  // Transactions
  async getTransactions(customerId?: string) {
    const response = await this.api.get(API_ENDPOINTS.TRANSACTIONS, {
      params: customerId ? { customer_id: customerId } : {},
    });
    const transactionsData = response.data.transactions || response.data || [];
    console.log('📋 Transactions loaded:', transactionsData.length);
    if (transactionsData.length > 0) {
      console.log('🔍 Sample transaction:', transactionsData[0].type, transactionsData[0].amount);
    }
    return response.data;
  }

  async addTransaction(data: {
    customer_id: string;
    type: 'credit' | 'payment';
    amount: number;
    notes?: string;
    receipt_url?: string;
    created_by?: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_TRANSACTION, data);
    return response.data;
  }

  // Customer-initiated transaction creation
  async createTransaction(businessId: string, amount: number, type: 'credit' | 'payment', notes?: string, billPhotoUri?: string) {
    // If we have a bill photo, use FormData for file upload
    if (billPhotoUri) {
      const formData = new FormData();
      formData.append('business_id', businessId);
      formData.append('transaction_type', type);
      formData.append('amount', amount.toString());
      formData.append('created_by', 'customer');
      
      if (notes && notes.trim()) {
        formData.append('notes', notes.trim());
      }
      
      // Add bill photo
      const filename = billPhotoUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('bill_photo', {
        uri: billPhotoUri,
        name: filename,
        type: fileType,
      } as any);
      
      const response = await this.api.post('/api/transaction/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    
    // No file, use JSON payload
    const payload: any = {
      business_id: businessId,
      transaction_type: type,
      amount,
      created_by: 'customer',
    };
    
    if (notes && notes.trim()) {
      payload.notes = notes.trim();
    }
    
    const response = await this.api.post('/api/transaction/create', payload);
    return response.data;
  }

  // Note: Backend doesn't support transaction update/delete operations
  // Transactions can only be created (POST /api/transaction/create)
  // To "delete", would need backend endpoint implementation

  // Products
  async getProducts() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS);
    const productsData = response.data.products || response.data || [];
    console.log('📋 Products loaded:', productsData.length);
    if (productsData.length > 0) {
      console.log('🔍 Sample product:', productsData[0].name);
      console.log('🔍 Product price:', productsData[0].price);
    }
    return response.data;
  }

  async addProduct(data: {
    name: string;
    category: string;
    subcategory?: string;
    description?: string;
    price: number;
    unit: string;
    stock_quantity: number;
    low_stock_threshold?: number;
    image_url?: string;
    product_image?: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_PRODUCT, data);
    return response.data;
  }

  async updateProduct(productId: string, data: any) {
    const response = await this.api.put(`/api/product/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string) {
    const response = await this.api.delete(`/api/product/${productId}`);
    return response.data;
  }

  async getProductCategories() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCT_CATEGORIES);
    return response.data;
  }

  async getProductUnits() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCT_UNITS);
    return response.data;
  }

  // Business
  async getBusinessInfo() {
    const response = await this.api.get(API_ENDPOINTS.BUSINESS_INFO);
    return response.data;
  }

  async updateBusiness(data: any) {
    const response = await this.api.post(API_ENDPOINTS.UPDATE_BUSINESS, data);
    return response.data;
  }

  // Profile
  async getProfile() {
    const response = await this.api.get(API_ENDPOINTS.PROFILE);
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  }

  async uploadProfilePhoto(photoUri: string) {
    const formData = new FormData();
    
    // Create file object from URI
    const filename = photoUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('profile_photo', {
      uri: photoUri,
      name: filename,
      type: type,
    } as any);
    
    const response = await this.api.post('/api/auth/upload-profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }




  // Invoice Generation
  async generateInvoice(data: any): Promise<string> {
    try {
      const response = await this.api.post('/api/generate-invoice', data, {
        responseType: 'blob'
      });

      const blob = response.data;
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const buyerName = data.buyer_name?.replace(/[^a-z0-9]/gi, '_') || 'invoice';
            const filename = `invoice_${buyerName}_${Date.now()}.pdf`;

            const filepath = `${FileSystem.documentDirectory}${filename}`;

            await FileSystem.writeAsStringAsync(
              filepath,
              base64data.split(',')[1],
              { encoding: 'base64' }
            );

            resolve(filepath);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      throw error;
    }
  }

  async updateLocation(data: { latitude: number; longitude: number; address: string }) {
    const response = await this.api.post(API_ENDPOINTS.UPDATE_LOCATION, data);
    return response.data;
  }

  async getLocation() {
    const response = await this.api.get(API_ENDPOINTS.LOCATION);
    return response.data;
  }

  // Vouchers & Offers
  async getVouchers() {
    const response = await this.api.get(API_ENDPOINTS.VOUCHERS);
    return response.data;
  }

  async addVoucher(data: {
    title: string;
    description: string;
    discount_type: string;
    discount_value: number;
    min_purchase?: number;
    max_discount?: number;
    valid_from: string;
    valid_until: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_VOUCHER, data);
    return response.data;
  }

  async addOffer(data: {
    title: string;
    description: string;
    product_id?: string;
    discount_percentage: number;
    valid_from: string;
    valid_until: string;
  }) {
    const response = await this.api.post(API_ENDPOINTS.ADD_OFFER, data);
    return response.data;
  }

  // QR Code
  async getQRCode() {
    const response = await this.api.get(API_ENDPOINTS.QR_CODE);
    return response.data;
  }

  async getAccessPin() {
    const response = await this.api.get(API_ENDPOINTS.ACCESS_PIN);
    return response.data;
  }

  // Stats
  async getStats() {
    const response = await this.api.get(API_ENDPOINTS.STATS);
    return response.data;
  }

  // Offers management methods

  async createOffer(data: any) {
    const response = await this.api.post('/api/offer', data);
    return response.data;
  }

  async toggleOffer(offerId: string) {
    const response = await this.api.put(`/api/offer/${offerId}/toggle`);
    return response.data;
  }

  async deleteOffer(offerId: string) {
    const response = await this.api.delete(`/api/offer/${offerId}`);
    return response.data;
  }



  async createVoucher(data: any) {
    const response = await this.api.post('/api/voucher', data);
    return response.data;
  }

  async toggleVoucher(voucherId: string) {
    const response = await this.api.put(`/api/voucher/${voucherId}/toggle`);
    return response.data;
  }

  async deleteVoucher(voucherId: string) {
    const response = await this.api.delete(`/api/voucher/${voucherId}`);
    return response.data;
  }

  // Image upload helper
  async uploadImage(uri: string, endpoint: string) {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new ApiService();
