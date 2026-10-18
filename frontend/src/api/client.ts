import axios, { AxiosInstance } from 'axios';

// Helper để lấy Token hiện tại từ localStorage
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (e) {
    console.error('Lỗi khi đọc token từ localStorage', e);
  }
  return null;
};

// Hàm gắn Interceptor gắn Token và xử lý response
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
        // Nếu bị 401 Unauthorized trên các route yêu cầu đăng nhập, có thể xóa token và chuyển hướng
        console.warn('Phiên đăng nhập hết hạn hoặc không hợp lệ.');
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
