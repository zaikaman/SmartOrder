// User and Authentication types
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  authProvider?: string;
  avatarUrl?: string;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
}

// Dining Table types
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';

export interface DiningTable {
  id: number;
  tableNumber: string;
  capacity: number;
  area: string;
  status: TableStatus;
  qrCodeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Menu Item types
export type MenuItemStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'INACTIVE';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description?: string;
  category: string;
  imageUrl?: string;
  status: MenuItemStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Order and Reservation types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'VNPAY' | 'CASH';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED';

export interface OrderItem {
  id?: number;
  menuItemId: number;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface ReservationOrder {
  id: number;
  orderCode: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tableId: number;
  tableNumber: string;
  reservationTime: string;
  partySize: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  vnpTxnRef?: string;
  emailSent: boolean;
  note?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
  note?: string;
}

export interface CreateOrderRequest {
  tableId: number;
  reservationTime: string;
  partySize: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  items?: CreateOrderItemRequest[];
}

export interface RevenueStats {
  totalRevenue: number;
  totalCompletedOrders: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}
