import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Types
export interface RegisterData {
  uid: string;
  uname: string;
  password: string;
  email: string;
  phone: string;
}

export interface LoginData {
  uname: string;
  password: string;
}

export interface User {
  uid: string;
  uname: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface BalanceResponse {
  balance: number;
  username: string;
  formattedBalance: string;
}

// API Functions
export const authAPI = {
  register: async (userData: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: LoginData): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/logout');
    return response.data;
  },

  verify: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/verify');
    return response.data;
  },

  getBalance: async (): Promise<ApiResponse<BalanceResponse>> => {
    const response = await api.get('/balance');
    return response.data;
  },
};

export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
