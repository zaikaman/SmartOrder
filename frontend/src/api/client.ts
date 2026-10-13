import axios, { AxiosInstance } from 'axios';

// Helper de lay Token hien tai tu localStorage
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (e) {
    console.error('Loi khi doc token tu localStorage', e);
  }
  return null;
};

// Ham gan Interceptor gan Token va xu ly response
const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Neu bi 401 Unauthorized tren cac route yeu cau dang nhap, co the xoa token va chuyen huong
        console.warn('Phien dang nhap het han hoac khong hop le.');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Service 1: Auth & User Service (Port 8081)
export const authApi = setupInterceptors(axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}));

// Service 2: Catalog & Table Service (Port 8082)
export const catalogApi = setupInterceptors(axios.create({
  baseURL: import.meta.env.VITE_CATALOG_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}));

// Service 3: Booking & Order Service (Port 8083)
export const bookingApi = setupInterceptors(axios.create({
  baseURL: import.meta.env.VITE_ORDER_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}));
